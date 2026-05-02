use delivery_tauri::commands;
use library::infrastructure::redb_repository::RedbMediaRepository;
use library::infrastructure::settings_repository::SettingsRepository; // <- IMPORT NOVO
use playback::infrastructure::rodio_player::RodioAudioPlayer;
use std::fs;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // commands library
            commands::cmd_scan_library,
            commands::cmd_get_all_assets,
            // commands playback
            commands::cmd_play_audio,
            commands::cmd_pause_audio,
            commands::cmd_resume_audio,
            commands::cmd_stop_audio,
            commands::cmd_seek_audio,
            commands::cmd_set_volume,
            commands::cmd_load_audio,
            // commands settings
            commands::cmd_get_settings,
            commands::cmd_update_settings,
        ])
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Falha ao encontrar pasta AppData");

            fs::create_dir_all(&app_data_dir).expect("Falha ao criar diretório do aplicativo");

            // 1. SETUP REDB (Library)
            let mut db_path = app_data_dir.clone();
            db_path.push("library.redb");
            
            let repository = RedbMediaRepository::new(db_path.to_str().unwrap())
                .expect("Falha crítica ao iniciar o Redb");
            app.manage(repository);

            // 2. SETUP AUDIO MOTOR
            let audio_player = RodioAudioPlayer::new();
            app.manage(audio_player);

            // 3. SETUP SETTINGS (Novo!)
            let settings_repo = SettingsRepository::new(&app_data_dir);
            app.manage(settings_repo); // Injeta o repositório

            println!("✅ Backend inicializado com sucesso!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Falha crítica ao iniciar o Universal Audio Manager");
}
