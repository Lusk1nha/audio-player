use library::application::scan_directory::{ScanDirectoryUseCase, ScanResult};
use library::domain::entities::MediaAsset;
use library::domain::traits::MediaRepository;
use library::infrastructure::fs_analyzer::LocalFileSystemAnalyzer;
use library::infrastructure::redb_repository::RedbMediaRepository;
use tauri::State;

#[tauri::command]
pub async fn cmd_get_all_assets(
    repo: State<'_, RedbMediaRepository>,
) -> Result<Vec<MediaAsset>, String> {
    println!("[Backend] Buscando todas as músicas salvas no banco...");
    repo.get_all().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cmd_scan_library(
    path: String,
    repo: State<'_, RedbMediaRepository>,
) -> Result<ScanResult, String> {
    println!("[Backend] Iniciando varredura real na pasta: {}", path);
    let analyzer = LocalFileSystemAnalyzer;
    let use_case = ScanDirectoryUseCase {
        analyzer,
        repository: (*repo).clone(),
    };
    use_case.execute(&path).await.map_err(|e| e.to_string())
}
