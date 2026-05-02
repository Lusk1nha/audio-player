use lofty::file::{AudioFile, TaggedFileExt};
use lofty::probe::Probe;
use lofty::tag::Accessor;
use std::path::Path;

use crate::domain::entities::AudioMetadata;
use crate::domain::errors::LibraryError;
use crate::domain::traits::AudioAnalyzer;

pub struct LocalFileSystemAnalyzer;

impl AudioAnalyzer for LocalFileSystemAnalyzer {
    fn extract_metadata(&self, file_path: &str) -> Result<AudioMetadata, LibraryError> {
        let path = Path::new(file_path);

        let format = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_string();

        let fallback_title = path
            .file_stem()
            .and_then(|name| name.to_str())
            .map(|s| s.to_string());

        let mut duration_seconds = 0;
        let mut title = fallback_title;
        let mut artist = Some("Unknown Artist".to_string());

        // A MÁGICA COMPLETA: Lendo Duração e Tags oficiais!
        match Probe::open(path).and_then(|probe| probe.read()) {
            Ok(tagged_file) => {
                // 1. Extrai a duração física
                duration_seconds = tagged_file.properties().duration().as_secs() as u32;

                // 2. Extrai as Tags (Tenta a tag principal, se não achar tenta qualquer outra disponível)
                if let Some(tag) = tagged_file
                    .primary_tag()
                    .or_else(|| tagged_file.first_tag())
                {
                    if let Some(tag_title) = tag.title() {
                        title = Some(tag_title.into_owned());
                    }
                    if let Some(tag_artist) = tag.artist() {
                        artist = Some(tag_artist.into_owned());
                    }
                }
            }
            Err(e) => {
                // Apenas logamos e mantemos os dados zerados/fallback para não travar a varredura
                eprintln!(
                    "[Aviso] Falha ao ler propriedades físicas de {}: {}",
                    file_path, e
                );
            }
        }

        Ok(AudioMetadata {
            duration_seconds,
            format,
            title,
            artist,
        })
    }
}
