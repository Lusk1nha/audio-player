use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioMetadata {
    pub duration_seconds: u32,
    pub format: String,
    pub title: Option<String>,
    pub artist: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AssetCategory {
    Music,
    Podcast,
    VoiceMessage,
    Uncategorized,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaAsset {
    pub id: Uuid,
    pub path: String,
    pub category: AssetCategory,
    pub metadata: AudioMetadata,
    pub filename: String,
    pub last_modified: u64,
}

impl AssetCategory {
    pub fn infer_from_metadata(metadata: &AudioMetadata) -> Self {
        // Se tiver mais de 30 minutos (1800 segundos), inferimos como Podcast.
        if metadata.duration_seconds > 1800 {
            AssetCategory::Podcast
        } else {
            AssetCategory::Music
        }
    }
}
