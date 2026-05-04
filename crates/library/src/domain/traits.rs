use async_trait::async_trait;
use serde::{Deserialize, Serialize}; // Importamos a macro

use super::{
    entities::{AudioMetadata, MediaAsset},
    errors::LibraryError,
};

pub trait AudioAnalyzer: Send + Sync {
    fn extract_metadata(&self, file_path: &str) -> Result<AudioMetadata, LibraryError>;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortOrder {
    #[serde(rename = "asc")]
    Ascending,
    #[serde(rename = "desc")]
    Descending,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortBy {
    #[serde(rename = "name")]
    Title,
    #[serde(rename = "artist")]
    Artist,
    #[serde(rename = "duration")]
    Duration,
    #[serde(rename = "recent")]
    None,
}

#[async_trait]
pub trait MediaRepository: Send + Sync {
    async fn save_batch(&self, assets: Vec<MediaAsset>) -> Result<(), LibraryError>;
    async fn get_all(&self) -> Result<Vec<MediaAsset>, LibraryError>;
    async fn remove(&self, asset_id: &str) -> Result<(), LibraryError>;

    async fn search(
        &self,
        query: &str,
        sort_by: SortBy,
        sort_order: SortOrder,
    ) -> Result<Vec<MediaAsset>, LibraryError>;
}
