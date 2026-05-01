use delivery_tauri::commands;
use library::infrastructure::redb_repository::RedbMediaRepository;
use playback::infrastructure::rodio_player::RodioAudioPlayer; // <- Import do motor de áudio
use std::fs;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        // As nossas rotas (Endpoints)
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
        ])
        // O Ciclo de Vida da Aplicação
        .setup(|app| {
            // --- 1. SETUP DO BANCO DE DADOS ---
            let mut db_path = app
                .path()
                .app_data_dir()
                .expect("Falha ao encontrar pasta AppData");

            fs::create_dir_all(&db_path).expect("Falha ao criar diretório do aplicativo");

            db_path.push("library.redb");
            let db_path_str = db_path.to_str().expect("Caminho inválido");

            let repository = RedbMediaRepository::new(db_path_str)
                .expect("Falha crítica ao iniciar o banco de dados Redb");

            app.manage(repository); // Injeta o banco

            // --- 2. SETUP DO MOTOR DE ÁUDIO ---
            let audio_player = RodioAudioPlayer::new();
            app.manage(audio_player); // Injeta o motor de áudio

            println!("✅ Backend Rust, Banco de Dados e Motor de Áudio inicializados com sucesso!");
            println!("📁 Banco salvo em: {}", db_path_str);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Falha crítica ao iniciar o Universal Audio Manager");
}
