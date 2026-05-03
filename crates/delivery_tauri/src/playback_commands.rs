use playback::domain::traits::AudioPlayer;
use playback::infrastructure::rodio_player::RodioAudioPlayer;
use tauri::State;

#[tauri::command]
pub fn cmd_play_audio(path: String, player: State<'_, RodioAudioPlayer>) -> Result<String, String> {
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
