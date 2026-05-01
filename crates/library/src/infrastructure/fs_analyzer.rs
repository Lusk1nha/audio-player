use lofty::file::AudioFile;
use lofty::probe::Probe;
use std::path::Path;

use crate::domain::entities::AudioMetadata;
use crate::domain::traits::AudioAnalyzer;

pub struct LocalFileSystemAnalyzer;

impl AudioAnalyzer for LocalFileSystemAnalyzer {
    fn extract_metadata(&self, file_path: &str) -> Result<AudioMetadata, String> {
        let path = Path::new(file_path);

        // 1. Mantemos a sua lógica perfeita para descobrir a extensão (.mp3, .wav)
        let format = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_string();

        // 2. Mantemos o seu fallback para o título (nome do arquivo físico)
        let fallback_title = path
            .file_stem()
            .and_then(|name| name.to_str())
            .map(|s| s.to_string());

        // 3. A MÁGICA: Usamos o Lofty para ler a duração real no cabeçalho do arquivo!
        let duration_seconds = match Probe::open(path).and_then(|probe| probe.read()) {
            Ok(tagged_file) => {
                let properties = tagged_file.properties();
                properties.duration().as_secs() as u32
            }
            Err(e) => {
                println!(
                    "[Aviso] Falha ao ler propriedades físicas de {}: {}",
                    file_path, e
                );
                0 // Retorna 0 em vez de quebrar a varredura se o arquivo for inválido
            }
        };

        // Retornamos a entidade do domínio com a duração cravada!
        Ok(AudioMetadata {
            duration_seconds,
            format,
            title: fallback_title, // Futuramente podemos extrair o Título Oficial das Tags ID3 aqui
            artist: Some("Unknown Artist".to_string()),
        })
    }
}
