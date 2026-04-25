use super::entities::{AudioMetadata, MediaAsset};

pub trait AudioAnalyzer {
    fn extract_metadata(&self, file_path: &str) -> Result<AudioMetadata, String>;
}

// Transformamos em async! O domínio não sabe qual é o banco, mas sabe que a operação demora.
pub trait MediaRepository {
    fn save_batch(&self, assets: Vec<MediaAsset>) -> impl std::future::Future<Output = Result<(), String>> + Send;
    fn get_all(&self) -> impl std::future::Future<Output = Result<Vec<MediaAsset>, String>> + Send;
}
