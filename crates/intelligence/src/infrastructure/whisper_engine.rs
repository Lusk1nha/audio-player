use std::fs::File;
use symphonia::core::audio::AudioBufferRef;
use symphonia::core::audio::Signal;
use symphonia::core::codecs::{DecoderOptions, CODEC_TYPE_NULL};
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

// Importações corretas para rubato 2.0.0
use rubato::audioadapter_buffers::direct::SequentialSliceOfVecs;
use rubato::{
    Async, FixedAsync, Resampler, SincInterpolationParameters, SincInterpolationType,
    WindowFunction,
};

use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

use crate::domain::entities::{Transcription, TranscriptionSegment};
use crate::domain::errors::IntelligenceError;

pub struct WhisperTranscriber {
    model_path: String,
}

impl WhisperTranscriber {
    pub fn new(model_path: String) -> Self {
        Self { model_path }
    }

    /// Resampling de Grau de Estúdio usando Rubato 2.0.0
    fn resample_audio(
        input: &[f32],
        in_rate: u32,
        out_rate: u32,
    ) -> Result<Vec<f32>, IntelligenceError> {
        if in_rate == out_rate {
            return Ok(input.to_vec());
        }

        let ratio = out_rate as f64 / in_rate as f64;
        let input_len = input.len();

        // Parâmetros de alta qualidade para áudio musical
        let params = SincInterpolationParameters {
            sinc_len: 256,
            f_cutoff: 0.95,
            interpolation: SincInterpolationType::Linear,
            oversampling_factor: 256,
            window: WindowFunction::BlackmanHarris2,
        };

        // Criando o Resampler assíncrono (Async) com tamanho de chunk igual ao áudio inteiro
        let mut resampler = Async::<f32>::new_sinc(
            ratio,
            1.0, // relative max ratio
            &params,
            input_len,         // chunk size
            1,                 // Canais (Mono)
            FixedAsync::Input, // Trabalhando com tamanho de entrada fixo
        )
        .map_err(|e| {
            IntelligenceError::ProcessingError(format!("Erro ao criar resampler: {:?}", e))
        })?;

        // Rubato 2.0.0 exige o formato de canais separados em Vecs
        let input_data = vec![input.to_vec()]; // 1 Canal

        // Criando o Adapter de entrada
        let input_adapter =
            SequentialSliceOfVecs::new(&input_data, 1, input_len).map_err(|_| {
                IntelligenceError::ProcessingError("Erro ao criar adapter de entrada".into())
            })?;

        // Calculando o tamanho necessário para a saída
        let output_len = resampler.process_all_needed_output_len(input_len);

        let mut output_data = vec![vec![0.0f32; output_len]; 1]; // 1 Canal

        // Criando o Adapter de saída
        let mut output_adapter = SequentialSliceOfVecs::new_mut(&mut output_data, 1, output_len)
            .map_err(|_| {
                IntelligenceError::ProcessingError("Erro ao criar adapter de saída".into())
            })?;

        // Processando o áudio inteiro
        let (_in_frames, out_frames) = resampler
            .process_all_into_buffer(&input_adapter, &mut output_adapter, input_len, None)
            .map_err(|e| {
                IntelligenceError::ProcessingError(format!(
                    "Erro no processamento do áudio: {:?}",
                    e
                ))
            })?;

        // Retorna apenas a quantidade de frames que realmente foram processados
        output_data[0].truncate(out_frames);

        Ok(output_data.pop().unwrap())
    }

    /// Normaliza o áudio para que o Whisper não sofra com vocais muito baixos
    fn normalize_audio(audio: &mut [f32]) {
        let max_amp = audio
            .iter()
            .cloned()
            .fold(0.0_f32, |max, val| max.max(val.abs()));
        if max_amp > 0.0 {
            // Normaliza para 95% do volume máximo para evitar distorção (clipping)
            let scale = 0.95 / max_amp;
            for sample in audio.iter_mut() {
                *sample *= scale;
            }
        }
    }

    fn process_audio_file(&self, path: &str) -> Result<Vec<f32>, IntelligenceError> {
        let file = File::open(path).map_err(|e| IntelligenceError::IoError(e))?;
        let mss = MediaSourceStream::new(Box::new(file), Default::default());

        let mut hint = Hint::new();
        if let Some(ext) = std::path::Path::new(path)
            .extension()
            .and_then(|s| s.to_str())
        {
            hint.with_extension(ext);
        }

        let probed = symphonia::default::get_probe()
            .format(
                &hint,
                mss,
                &FormatOptions::default(),
                &MetadataOptions::default(),
            )
            .map_err(|e| IntelligenceError::ProcessingError(e.to_string()))?;

        let mut format = probed.format;
        let track = format
            .tracks()
            .iter()
            .find(|t| t.codec_params.codec != CODEC_TYPE_NULL)
            .ok_or_else(|| IntelligenceError::ProcessingError("Nenhuma track de áudio".into()))?;

        let original_sample_rate = track.codec_params.sample_rate.unwrap_or(44100);

        let mut decoder = symphonia::default::get_codecs()
            .make(&track.codec_params, &DecoderOptions::default())
            .map_err(|e| IntelligenceError::ProcessingError(e.to_string()))?;

        let track_id = track.id;
        let mut pcm_data = Vec::new();

        // 1. Decodificação e Downmix para Mono
        while let Ok(packet) = format.next_packet() {
            if packet.track_id() != track_id {
                continue;
            }

            match decoder.decode(&packet) {
                Ok(AudioBufferRef::F32(buf)) => {
                    let channels = buf.spec().channels.count();
                    for f in 0..buf.frames() {
                        let mut sum = 0.0;
                        for c in 0..channels {
                            sum += buf.chan(c)[f];
                        }
                        pcm_data.push(sum / channels as f32);
                    }
                }
                Ok(AudioBufferRef::S16(buf)) => {
                    let channels = buf.spec().channels.count();
                    for f in 0..buf.frames() {
                        let mut sum = 0.0;
                        for c in 0..channels {
                            sum += buf.chan(c)[f] as f32 / 32768.0;
                        }
                        pcm_data.push(sum / channels as f32);
                    }
                }
                _ => {}
            }
        }

        if pcm_data.is_empty() {
            return Err(IntelligenceError::ProcessingError(
                "Buffer de áudio vazio".into(),
            ));
        }

        // 2. Resampling de Alta Qualidade (anti-aliasing)
        let mut final_pcm = Self::resample_audio(&pcm_data, original_sample_rate, 16000)?;

        // 3. Normalização de Volume
        Self::normalize_audio(&mut final_pcm);

        Ok(final_pcm)
    }

    pub fn transcribe_file(&self, path: &str) -> Result<Transcription, IntelligenceError> {
        let pcm_data = self.process_audio_file(path)?;

        let ctx =
            WhisperContext::new_with_params(&self.model_path, WhisperContextParameters::default())
                .map_err(|e| IntelligenceError::EngineInitializationFailed(e.to_string()))?;

        // 1. Configurações da Janela Deslizante (Chunking)
        let sample_rate = 16000;
        let chunk_duration_sec = 30; // Whisper respira em blocos de 30s
        let overlap_sec = 2; // Retorno no tempo para não cortar palavras
        let stride_sec = chunk_duration_sec - overlap_sec;

        let chunk_samples = chunk_duration_sec * sample_rate;
        let stride_samples = stride_sec * sample_rate;

        let mut all_segments = Vec::new();
        let mut current_sample = 0;

        // Reutilizamos o state para economizar memória
        let mut state = ctx
            .create_state()
            .map_err(|e| IntelligenceError::EngineInitializationFailed(e.to_string()))?;

        // 2. Loop de Janelamento sobre o Áudio Inteiro
        while current_sample < pcm_data.len() {
            // Garante que não vamos ler fora do limite do array
            let end_sample = std::cmp::min(current_sample + chunk_samples, pcm_data.len());
            let chunk = &pcm_data[current_sample..end_sample];

            let mut params = FullParams::new(SamplingStrategy::BeamSearch {
                beam_size: 5,
                patience: 1.0,
            });

            params.set_print_progress(false);
            params.set_print_special(false);
            params.set_print_realtime(false);
            params.set_print_timestamps(false);
            params.set_language(Some("auto"));
            params.set_temperature_inc(0.2);
            params.set_entropy_thold(2.4);
            params.set_logprob_thold(-1.0);
            params.set_no_speech_thold(0.6);
            params
                .set_initial_prompt("Letras de música. Refrão, estrofe, cantado, melodia, música.");

            // 🟢 A Mágica do Karaokê: Força o Whisper a dar tempo por palavra
            params.set_token_timestamps(true);
            params.set_max_len(1); // Força os segmentos a serem curtos (ideal para UIs de música)

            // Executa a IA apenas naquele pedacinho de 30s
            state
                .full(params, chunk)
                .map_err(|e| IntelligenceError::TranscriptionFailed(e.to_string()))?;

            let num_segments = state.full_n_segments();

            // O tempo exato na música onde este chunk começou
            let chunk_start_time = current_sample as f32 / sample_rate as f32;

            for i in 0..num_segments {
                let segment = state
                    .get_segment(i)
                    .expect("Falha ao ler o segmento de áudio");
                let text = segment
                    .to_str_lossy()
                    .expect("Falha ao converter texto")
                    .into_owned();

                if text.trim().is_empty() {
                    continue;
                }

                // 3. Sincronização de Relógios (Timestamps Relativos -> Absolutos)
                // O Whisper acha que cada chunk começa do 00:00. Precisamos somar o offset real da música.
                let start_time = chunk_start_time + (segment.start_timestamp() as f32 / 100.0);
                let end_time = chunk_start_time + (segment.end_timestamp() as f32 / 100.0);

                // 4. A Lógica de Deduplicação (Anti-Repetição)
                // Se a palavra lida caiu na zona final de "overlap" (os últimos 2 segundos do chunk)
                // E não é o último chunk da música, nós IGNORAMOS.
                // Ela será transcrita corretamente (e sem ser cortada) no início do próximo chunk.
                let is_last_chunk = end_sample == pcm_data.len();
                if !is_last_chunk && (start_time - chunk_start_time) > stride_sec as f32 {
                    continue;
                }

                all_segments.push(TranscriptionSegment {
                    start_time,
                    end_time,
                    text: text.trim().to_string(),
                });
            }

            // Avança a janela (30s de leitura, mas avança apenas 28s para cruzar 2s de segurança)
            current_sample += stride_samples;
        }

        Ok(Transcription {
            asset_id: uuid::Uuid::new_v4(),
            segments: all_segments,
            language: "auto".to_string(),
        })
    }
}
