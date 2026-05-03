use symphonia::core::audio::AudioBufferRef;
use symphonia::core::codecs::{DecoderOptions, CODEC_TYPE_NULL};
use symphonia::core::errors::Error;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;
use std::fs::File;
use symphonia::core::audio::Signal;
pub fn prepare_audio_for_whisper(path: &str) -> Result<Vec<f32>, String> {
    let src = File::open(path).map_err(|e| e.to_string())?;
    let mss = MediaSourceStream::new(Box::new(src), Default::default());

    let mut hint = Hint::new();
    hint.with_extension("mp3"); // Opcional, ajuda o probe

    let meta_opts = MetadataOptions::default();
    let fmt_opts = FormatOptions::default();

    // 1. Tenta descobrir o formato do arquivo
    let probed = symphonia::default::get_probe()
        .format(&hint, mss, &fmt_opts, &meta_opts)
        .map_err(|e| e.to_string())?;

    let mut format = probed.format;

    // 2. Encontra a trilha de áudio padrão
    let track = format
        .tracks()
        .iter()
        .find(|t| t.codec_params.codec != CODEC_TYPE_NULL)
        .ok_or("Nenhuma trilha de áudio encontrada")?;

    let mut decoder = symphonia::default::get_codecs()
        .make(&track.codec_params, &DecoderOptions::default())
        .map_err(|e| e.to_string())?;

    let track_id = track.id;
    let mut pcm_data: Vec<f32> = Vec::new();

    // 3. Loop de decodificação
    while let Ok(packet) = format.next_packet() {
        if packet.track_id() != track_id { continue; }

        match decoder.decode(&packet) {
            Ok(AudioBufferRef::F32(buf)) => {
                // Aqui converteríamos para Mono se fosse Stereo
                // E faríamos o resample para 16kHz
                pcm_data.extend(buf.chan(0)); 
            }
            Ok(_decoded) => {
                // Se o buffer vier em outro formato (I16, U8, etc), 
                // precisaríamos converter para F32 aqui.
                return Err("Formato de áudio não suportado (esperado F32)".to_string());
            }
            Err(Error::IoError(_)) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(pcm_data)
}