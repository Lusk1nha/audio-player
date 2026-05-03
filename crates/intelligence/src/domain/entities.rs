use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptionSegment {
    pub start_time: f32,
    pub end_time: f32,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transcription {
    pub asset_id: uuid::Uuid, // Ligação direta com o seu MediaAsset
    pub segments: Vec<TranscriptionSegment>,
    pub language: String,
}
