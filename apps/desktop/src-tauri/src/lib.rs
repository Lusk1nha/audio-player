use delivery_tauri::commands;
use library::infrastructure::redb_repository::RedbMediaRepository;
use std::fs;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        // As nossas rotas (Endpoints)
        .invoke_handler(tauri::generate_handler![
            commands::cmd_play_audio,
            commands::cmd_scan_library,
        ])
        // O Ciclo de Vida da Aplicação
        .setup(|app| {
            let mut db_path = app
                .path()
                .app_data_dir()
                .expect("Falha ao encontrar pasta AppData");

            fs::create_dir_all(&db_path).expect("Falha ao criar diretório do aplicativo");

            db_path.push("library.redb");
            let db_path_str = db_path.to_str().expect("Caminho inválido");

            let repository = RedbMediaRepository::new(db_path_str)
                .expect("Falha crítica ao iniciar o banco de dados Redb");

            app.manage(repository);

            println!("✅ Backend Rust e Banco de Dados inicializados com sucesso!");
            println!("📁 Banco salvo em: {}", db_path_str);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Falha crítica ao iniciar o Universal Audio Manager");
}
