use uuid::Uuid;
use walkdir::WalkDir;

use crate::domain::entities::{AssetCategory, MediaAsset};
use crate::domain::traits::{AudioAnalyzer, MediaRepository};

pub struct ScanResult {
    pub scanned_files: u32,
    pub new_assets: Vec<MediaAsset>,
}

pub struct ScanDirectoryUseCase<A: AudioAnalyzer, R: MediaRepository> {
    pub analyzer: A,
    pub repository: R,
}

impl<A: AudioAnalyzer, R: MediaRepository> ScanDirectoryUseCase<A, R> {
    pub async fn execute(&self, directory_path: &str) -> Result<ScanResult, String> {
        let mut new_assets = Vec::new();
        let mut files_scanned = 0;

        // 1. Usa o walkdir para ler a pasta recursivamente (muito rápido)
        for entry in WalkDir::new(directory_path)
            .into_iter()
            .filter_map(Result::ok) // Ignora pastas sem permissão
            .filter(|e| e.file_type().is_file())
        {
            let path_str = entry.path().to_string_lossy().to_string();

            // Filtra apenas arquivos de áudio
            if path_str.ends_with(".mp3")
                || path_str.ends_with(".wav")
                || path_str.ends_with(".flac")
            {
                // 2. Extrai Metadados usando a interface (Inversão de Dependência)
                if let Ok(metadata) = self.analyzer.extract_metadata(&path_str) {
                    // 3. Regra de Negócio: Categorização
                    let category = if metadata.duration_seconds > 1800 {
                        AssetCategory::Podcast // Mais de 30 min = Podcast
                    } else {
                        AssetCategory::Music
                    };

                    let asset_id = Uuid::new_v5(&Uuid::NAMESPACE_URL, path_str.as_bytes());

                    let asset = MediaAsset {
                        id: asset_id,
                        path: path_str,
                        category,
                        metadata,
                    };

                    new_assets.push(asset);
                }
                files_scanned += 1;
            }
        }

        self.repository.save_batch(new_assets.clone()).await?;

        Ok(ScanResult {
            scanned_files: files_scanned,
            new_assets,
        })
    }
}
