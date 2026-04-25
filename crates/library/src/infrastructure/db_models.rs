use crate::domain::entities::{AssetCategory, AudioMetadata, MediaAsset};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct MediaAssetRecord {
    pub id: String,
    pub path: String,
    pub category: String,
    pub duration_seconds: u32,
    pub format: String,
    pub title: Option<String>,
    pub artist: Option<String>,
}

// Convertendo do Domínio para o Banco de Dados
impl From<MediaAsset> for MediaAssetRecord {
    fn from(asset: MediaAsset) -> Self {
        Self {
            id: format!("media_asset:{}", asset.id),
            path: asset.path,
            category: asset.category.to_string(),
            duration_seconds: asset.metadata.duration_seconds,
            format: asset.metadata.format,
            title: asset.metadata.title,
            artist: asset.metadata.artist,
        }
    }
}

// Convertendo do Banco de Dados de volta para o Domínio
impl From<MediaAssetRecord> for MediaAsset {
    fn from(record: MediaAssetRecord) -> Self {
        let raw_uuid = record.id.replace("media_asset:", "");

        MediaAsset {
            id: Uuid::parse_str(&raw_uuid).unwrap_or_else(|_| Uuid::new_v4()),
            path: record.path,
            category: match record.category.as_str() {
                "Podcast" => AssetCategory::Podcast,
                "VoiceMessage" => AssetCategory::VoiceMessage,
                "Music" => AssetCategory::Music,
                _ => AssetCategory::Uncategorized,
            },
            metadata: AudioMetadata {
                duration_seconds: record.duration_seconds,
                format: record.format,
                title: record.title,
                artist: record.artist,
            },
        }
    }
}
