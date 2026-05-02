use delivery_tauri::commands;
use library::infrastructure::redb_repository::RedbMediaRepository;
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
            commands::cmd_load_audio
        ])
        // O Ciclo de Vida da Aplicação
        .setup(|app| {
            // --- 1. SETUP DO BANCO DE DADOS ---
            let mut db_path = app
                .path()
                .app_data_dir()
                .expect("Falha fatal: O sistema operacional negou acesso à pasta AppData.");

            fs::create_dir_all(&db_path)
                .expect("Falha fatal: Sem permissão para criar a pasta do aplicativo.");

            db_path.push("library.redb");
            let db_path_str = db_path.to_str().expect("Caminho de arquivo inválido no SO");

            // Tratamento elegante do nosso LibraryError
            let repository = match RedbMediaRepository::new(db_path_str) {
                Ok(repo) => repo,
                Err(e) => {
                    // Imprime o erro formatado bonitinho que definimos no thiserror
                    eprintln!("❌ Falha crítica ao iniciar o banco de dados: {}", e);
                    // Encerra o app graciosamente com código de erro 1
                    std::process::exit(1);
                }
            };

            app.manage(repository); // Injeta o banco

            // --- 2. SETUP DO MOTOR DE ÁUDIO ---
            // Cria apenas o transmissor (A thread pesada só nasce no primeiro Play)
            let audio_player = RodioAudioPlayer::new();
            app.manage(audio_player); // Injeta o motor de áudio

            println!("✅ Backend Rust inicializado com sucesso!");
            println!("📁 Banco salvo em: {}", db_path_str);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Falha crítica ao iniciar o motor interno do Tauri");
}
