use tauri::State;

use library::domain::traits::MediaRepository;
use playback::domain::traits::AudioPlayer;
use playback::infrastructure::rodio_player::RodioAudioPlayer;

// Importamos os nossos módulos de negócio
use library::application::scan_directory::{ScanDirectoryUseCase, ScanResult};
use library::domain::entities::MediaAsset;
use library::infrastructure::fs_analyzer::LocalFileSystemAnalyzer;
use library::infrastructure::redb_repository::RedbMediaRepository;

// =========================================================================
// COMMANDS DE BIBLIOTECA (Library)
// =========================================================================

#[tauri::command]
pub async fn cmd_get_all_assets(
    repo: State<'_, RedbMediaRepository>,
) -> Result<Vec<MediaAsset>, String> { // Retornamos o Vec nativo do Rust!
    println!("[Backend] Buscando todas as músicas salvas no banco...");

    // O Tauri vai serializar o Vec<MediaAsset> para JSON automaticamente
    repo.get_all().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cmd_scan_library(
    path: String,
    repo: State<'_, RedbMediaRepository>,
) -> Result<ScanResult, String> { // Retornamos o ScanResult nativo!
    println!("[Backend] Iniciando varredura real na pasta: {}", path);

    let analyzer = LocalFileSystemAnalyzer;
    let use_case = ScanDirectoryUseCase {
        analyzer,
        repository: (*repo).clone(),
    };

    // Executa o caso de uso. Se der erro, mapeia para String. Se der sucesso, o Tauri vira JSON!
    use_case.execute(&path).await.map_err(|e| e.to_string())
}

// =========================================================================
// COMMANDS DE PLAYBACK (Áudio)
// =========================================================================

#[tauri::command]
pub fn cmd_play_audio(
    path: String,
    player: State<'_, RodioAudioPlayer>,
) -> Result<String, String> {
    println!("[Backend] Solicitado o início do áudio: {}", path);
    player.play(&path).map_err(|e| e.to_string())?;
    Ok(format!("Tocando {}", path))
}

#[tauri::command]
pub fn cmd_pause_audio(player: State<'_, RodioAudioPlayer>) -> Result<(), String> {
    println!("[Backend] Pausando áudio");
    player.pause().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_resume_audio(player: State<'_, RodioAudioPlayer>) -> Result<(), String> {
    println!("[Backend] Retomando áudio");
    player.resume().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_stop_audio(player: State<'_, RodioAudioPlayer>) -> Result<(), String> {
    println!("[Backend] Parando áudio");
    player.stop().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_seek_audio(
    position_seconds: u64,
    player: State<'_, RodioAudioPlayer>,
) -> Result<(), String> {
    println!("[Backend] Pulando para {} segundos", position_seconds);
    player.seek(position_seconds).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_set_volume(volume: f32, player: State<'_, RodioAudioPlayer>) -> Result<(), String> {
    println!("[Backend] Alterando volume para: {}", volume);
    player.set_volume(volume).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_load_audio(
    path: String,
    position_seconds: u64,
    player: State<'_, RodioAudioPlayer>,
) -> Result<(), String> {
    println!(
        "[Backend] Restaurando áudio silenciosamente: {} no tempo {}s",
        path, position_seconds
    );
    player
        .load_track(&path, position_seconds)
        .map_err(|e| e.to_string())
}