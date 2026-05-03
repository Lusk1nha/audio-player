use delivery_tauri::{
    intelligence_commands, library_commands, playback_commands, settings_commands,
};

use library::infrastructure::redb_repository::RedbMediaRepository;
use library::infrastructure::settings_repository::SettingsRepository;
use playback::infrastructure::rodio_player::RodioAudioPlayer;
// 1. IMPORT NOVO (Para o motor de IA)
use intelligence::infrastructure::ai_module_manager::WhisperModuleManager;
use std::fs;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // commands library
            library_commands::cmd_scan_library,
            library_commands::cmd_get_all_assets,
            // commands playback
            playback_commands::cmd_play_audio,
            playback_commands::cmd_pause_audio,
            playback_commands::cmd_resume_audio,
            playback_commands::cmd_stop_audio,
            playback_commands::cmd_seek_audio,
            playback_commands::cmd_set_volume,
            playback_commands::cmd_load_audio,
            // commands settings
            settings_commands::cmd_get_settings,
            settings_commands::cmd_update_settings,
            // commands intelligence
            intelligence_commands::cmd_check_ai_engine,
            intelligence_commands::cmd_download_ai_engine,
            intelligence_commands::cmd_transcribe_audio, // 2. COMANDO NOVO ADICIONADO AQUI
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

            // 3. SETUP SETTINGS
            let settings_repo = SettingsRepository::new(&app_data_dir);
            app.manage(settings_repo);

            // 4. SETUP INTELLIGENCE (Novo!)
            let whisper_manager = WhisperModuleManager::new(app_data_dir.clone());
            app.manage(whisper_manager);

            println!("✅ Backend inicializado com sucesso!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Falha crítica ao iniciar o Universal Audio Manager");
}
