// Importamos os comandos do nosso Adapter (Módulo Modular)
use delivery_tauri::commands;

/// Estrutura de Estado Global da Aplicação (Injeção de Dependência)
/// É aqui que no futuro guardaremos a conexão com o SurrealDB
/// e as instâncias dos nossos Use Cases (DDD).
pub struct AppState {
    // Exemplo para o futuro:
    // pub db_connection: Surreal<Db>,
    // pub library_use_cases: LibraryUseCases,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Inicializamos o construtor do Tauri
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        // Plugins padrão
        .plugin(tauri_plugin_opener::init())
        // 1. INJEÇÃO DE DEPENDÊNCIA:
        // Compartilha o estado (banco, configs) com todos os comandos do Tauri
        .manage(AppState {
            // Inicializa as dependências aqui
        })
        // 2. REGISTRO DE ROTAS (Adapters):
        // Conecta os comandos IPC do front-end com as funções do Rust
        .invoke_handler(tauri::generate_handler![
            commands::cmd_play_audio,
            commands::cmd_scan_library,
        ])
        // 3. CICLO DE VIDA (Setup):
        // Roda regras pesadas (ex: migrações de banco) antes da UI abrir
        .setup(|_app| {
            // let app_handle = app.handle();
            // log::info!("Inicializando o Universal Audio Manager...");

            // Aqui você pode configurar atalhos de teclado globais,
            // ler arquivos de configuração do OS, etc.

            println!("✅ Backend Rust inicializado com sucesso!");
            Ok(())
        })
        // Executa o loop da aplicação
        .run(tauri::generate_context!())
        .expect("Falha crítica ao iniciar o Universal Audio Manager");
}
