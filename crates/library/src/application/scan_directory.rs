use serde::Serialize;
use uuid::Uuid;
use walkdir::WalkDir;

use crate::domain::entities::{AssetCategory, MediaAsset};
use crate::domain::errors::LibraryError;
use crate::domain::traits::{AudioAnalyzer, MediaRepository};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub scanned_files: u32,
    pub new_assets: Vec<MediaAsset>,
}

pub struct ScanDirectoryUseCase<A: AudioAnalyzer, R: MediaRepository> {
    pub analyzer: A,
    pub repository: R,
}

impl<A: AudioAnalyzer, R: MediaRepository> ScanDirectoryUseCase<A, R> {
    pub async fn execute(&self, directory_path: &str) -> Result<ScanResult, LibraryError> {
        let mut new_assets = Vec::new();
        let mut files_scanned = 0;

        // Lista de formatos suportados
        let supported_extensions = ["mp3", "wav", "flac", "m4a", "ogg"];

        for entry in WalkDir::new(directory_path)
            .into_iter()
            .filter_map(Result::ok)
            .filter(|e| e.file_type().is_file())
        {
            let path = entry.path();

            // Pega a extensão do arquivo de forma segura e transforma em lowercase
            let is_audio = path
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| supported_extensions.contains(&ext.to_lowercase().as_str()))
                .unwrap_or(false);

            if is_audio {
                let path_str = path.to_string_lossy().to_string();

                // 1. Extrai Metadados
                if let Ok(metadata) = self.analyzer.extract_metadata(&path_str) {
                    // 2. Delega a regra de negócio para a Entidade do Domínio! (Clean Code)
                    let category = AssetCategory::infer_from_metadata(&metadata);

                    let asset_id = Uuid::new_v5(&Uuid::NAMESPACE_URL, path_str.as_bytes());
                    let file_name = entry.file_name().to_string_lossy().into_owned();

                    let last_modified = entry
                        .metadata()
                        .ok()
                        .and_then(|m| m.modified().ok())
                        .map(|t| {
                            t.duration_since(std::time::UNIX_EPOCH)
                                .unwrap_or_default()
                                .as_secs()
                        })
                        .unwrap_or(0);

                    let asset = MediaAsset {
                        id: asset_id,
                        path: path_str,
                        category,
                        metadata,
                        filename: file_name,
                        last_modified,
                    };

                    new_assets.push(asset);
                }
                files_scanned += 1;
            }
        }

        println!("Músicas encontradas: {:#?}", new_assets);
        // Salva tudo no banco Redb via Inversão de Dependência
        self.repository.save_batch(new_assets.clone()).await?;

        Ok(ScanResult {
            scanned_files: files_scanned,
            new_assets,
        })
    }
}
