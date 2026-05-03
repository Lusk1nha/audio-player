use super::entities::Transcription;
use super::errors::IntelligenceError;
use async_trait::async_trait;
use library::domain::entities::MediaAsset;

#[async_trait]
pub trait AudioTranscriber: Send + Sync {
    /// Inicia o processo de transcrição local
    async fn transcribe(&self, asset: &MediaAsset) -> Result<Transcription, IntelligenceError>;
}

#[async_trait]
pub trait AiModuleManager: Send + Sync {
    /// Verifica se os arquivos do Whisper (.bin) existem na AppData
    fn check_engine_status(&self) -> bool;

    /// Realiza o download do modelo caso o usuário solicite a "instalação" do complemento
    async fn download_engine(&self, window: tauri::Window) -> Result<(), IntelligenceError>;
}
