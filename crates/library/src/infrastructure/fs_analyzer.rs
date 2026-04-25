use crate::domain::entities::AudioMetadata;
use crate::domain::traits::AudioAnalyzer;

use std::path::Path;

pub struct LocalFileSystemAnalyzer;

impl AudioAnalyzer for LocalFileSystemAnalyzer {
    fn extract_metadata(&self, file_path: &str) -> Result<AudioMetadata, String> {
        let path = Path::new(file_path);

        // Pega a extensão do arquivo (ex: "mp3")
        let format = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Pega o nome do arquivo sem a extensão para usar como título provisório
        let title = path
            .file_stem()
            .and_then(|name| name.to_str())
            .map(|s| s.to_string());

        // No futuro, você colocaria a biblioteca `lofty` aqui para ler as tags ID3 reais.
        // Por enquanto, geramos dados baseados no arquivo físico.
        Ok(AudioMetadata {
            duration_seconds: 180, // Mock de 3 minutos
            format,
            title,
            artist: Some("Unknown Artist".to_string()),
        })
    }
}
