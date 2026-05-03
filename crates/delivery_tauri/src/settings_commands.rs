use tauri::State;
use library::infrastructure::settings_repository::{SettingsDto, SettingsRepository};

#[tauri::command]
pub fn cmd_get_settings(repo: State<'_, SettingsRepository>) -> Result<String, String> {
    println!("[Backend] Lendo config.toml...");
    let settings = repo.get()?;
    serde_json::to_string(&settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_update_settings(
    payload: SettingsDto,
    repo: State<'_, SettingsRepository>,
) -> Result<(), String> {
    println!("[Backend] Salvando novas configurações no config.toml...");
    repo.save(&payload)
}