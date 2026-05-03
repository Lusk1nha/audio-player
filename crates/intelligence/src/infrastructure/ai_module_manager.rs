use async_trait::async_trait;
use futures_util::StreamExt;
use std::fs;
use std::path::PathBuf;
use tauri::{Emitter, Window}; // Para enviar eventos para o JS
use tokio::io::AsyncWriteExt;

use crate::domain::errors::IntelligenceError;
use crate::domain::traits::AiModuleManager;

pub struct WhisperModuleManager {
    base_path: PathBuf, // Geralmente app_data_dir/engine/whisper
}

impl WhisperModuleManager {
    pub fn new(app_data_dir: PathBuf) -> Self {
        let mut base_path = app_data_dir;
        base_path.push("engine");
        base_path.push("whisper");

        Self { base_path }
    }

    fn get_model_path(&self) -> PathBuf {
        let mut path = self.base_path.clone();
        path.push("ggml-tiny.bin");
        path
    }

    pub fn get_model_path_str(&self) -> String {
        self.get_model_path().to_string_lossy().to_string()
    }
}

#[async_trait]
impl AiModuleManager for WhisperModuleManager {
    fn check_engine_status(&self) -> bool {
        self.get_model_path().exists()
    }

    async fn download_engine(&self, window: Window) -> Result<(), IntelligenceError> {
        fs::create_dir_all(&self.base_path).map_err(|e| IntelligenceError::IoError(e))?;

        let model_url = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin";
        let response = reqwest::get(model_url)
            .await
            .map_err(|e| IntelligenceError::TranscriptionFailed(e.to_string()))?;

        // Pegamos o tamanho total para calcular a porcentagem
        let total_size = response.content_length().unwrap_or(0);
        let mut downloaded: u64 = 0;
        let mut stream = response.bytes_stream();

        let mut file = tokio::fs::File::create(self.get_model_path())
            .await
            .map_err(|e| IntelligenceError::IoError(e))?;

        while let Some(item) = stream.next().await {
            let chunk = item.map_err(|e| IntelligenceError::TranscriptionFailed(e.to_string()))?;
            file.write_all(&chunk)
                .await
                .map_err(|e| IntelligenceError::IoError(e))?;

            downloaded += chunk.len() as u64;

            // EMITIR EVENTO PARA O FRONTEND
            if total_size > 0 {
                let percentage = (downloaded as f32 / total_size as f32) * 100.0;
                // Enviamos um evento chamado 'ai-download-progress'
                window.emit("ai-download-progress", percentage).unwrap();
            }
        }

        Ok(())
    }
}
