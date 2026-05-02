use crate::domain::entities::{AssetCategory, AudioMetadata, MediaAsset};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct MediaAssetRecord {
    pub id: String,
    pub path: String,
    pub category: AssetCategory,
    pub duration_seconds: u32,
    pub format: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub filename: String,
    pub last_modified: u64,
}

impl From<MediaAsset> for MediaAssetRecord {
    fn from(asset: MediaAsset) -> Self {
        Self {
            id: asset.id.to_string(),
            path: asset.path,
            category: asset.category,
            duration_seconds: asset.metadata.duration_seconds,
            format: asset.metadata.format,
            title: asset.metadata.title,
            artist: asset.metadata.artist,
            filename: asset.filename,
            last_modified: asset.last_modified,
        }
    }
}

impl TryFrom<MediaAssetRecord> for MediaAsset {
    type Error = uuid::Error;

    // Usamos TryFrom porque o UUID no banco pode estar corrompido, e não queremos um panic! (unwrap)
    fn try_from(record: MediaAssetRecord) -> Result<Self, Self::Error> {
        Ok(MediaAsset {
            id: Uuid::parse_str(&record.id)?,
            path: record.path,
            category: record.category,
            filename: record.filename,
            last_modified: record.last_modified,
            metadata: AudioMetadata {
                duration_seconds: record.duration_seconds,
                format: record.format,
                title: record.title,
                artist: record.artist,
            },
        })
    }
}