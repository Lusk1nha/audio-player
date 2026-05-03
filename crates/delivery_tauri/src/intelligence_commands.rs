use intelligence::domain::{entities::TranscriptionSegment, traits::AiModuleManager};
use intelligence::infrastructure::ai_module_manager::WhisperModuleManager;
use intelligence::infrastructure::whisper_engine::WhisperTranscriber;
use serde::Serialize;
use tauri::{State, Window};

#[derive(Default, Serialize)]
pub struct TranscriptionResult {
    pub text: String,
}

#[tauri::command]
pub async fn cmd_check_ai_engine(manager: State<'_, WhisperModuleManager>) -> Result<bool, String> {
    println!("[Backend] Checando status do motor de IA local...");
    Ok(manager.check_engine_status())
}

#[tauri::command]
pub async fn cmd_download_ai_engine(
    window: Window,
    manager: State<'_, WhisperModuleManager>,
) -> Result<(), String> {
    println!("[Backend] Iniciando download do modelo de IA...");
    manager
        .download_engine(window)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn cmd_transcribe_audio(
    path: String,
    manager: State<'_, WhisperModuleManager>,
) -> Result<Vec<TranscriptionSegment>, String> {
    if !manager.check_engine_status() {
        return Err("Módulo de IA não instalado".to_string());
    }

    // Pega o caminho real de onde o modelo ggml-tiny.bin foi salvo
    // (Você precisará expor um método no manager para pegar esse path, ex: manager.get_model_path_str())
    let model_path = manager.get_model_path_str();

    // Instancia o transcriber (agora com a lógica do whisper-rs embutida)
    let transcriber = WhisperTranscriber::new(model_path);

    // Executa a transcrição
    let transcription = transcriber
        .transcribe_file(&path)
        .map_err(|e| e.to_string())?;

    // (Opcional) Converter seu Transcription interno para o TranscriptionResult do Tauri
    Ok(transcription.segments)
}
