use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct AudioMetadata {
    pub duration_seconds: u32,
    pub format: String,
    pub title: Option<String>,
    pub artist: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum AssetCategory {
    Music,
    Podcast,
    VoiceMessage,
    Uncategorized,
}

impl ToString for AssetCategory {
    fn to_string(&self) -> String {
        match self {
            AssetCategory::Music => "Music".to_string(),
            AssetCategory::Podcast => "Podcast".to_string(),
            AssetCategory::VoiceMessage => "VoiceMessage".to_string(),
            AssetCategory::Uncategorized => "Uncategorized".to_string(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct MediaAsset {
    pub id: Uuid,
    pub path: String,
    pub category: AssetCategory,
    pub metadata: AudioMetadata,
    pub filename: String,
    pub last_modified: u64,
}
