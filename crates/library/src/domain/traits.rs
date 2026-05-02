use async_trait::async_trait; // Importamos a macro

use super::{
    entities::{AudioMetadata, MediaAsset},
    errors::LibraryError,
};

pub trait AudioAnalyzer: Send + Sync {
    fn extract_metadata(&self, file_path: &str) -> Result<AudioMetadata, LibraryError>;
}

#[async_trait]
pub trait MediaRepository: Send + Sync {
    async fn save_batch(&self, assets: Vec<MediaAsset>) -> Result<(), LibraryError>;
    async fn get_all(&self) -> Result<Vec<MediaAsset>, LibraryError>;
    async fn remove(&self, asset_id: &str) -> Result<(), LibraryError>;
}
