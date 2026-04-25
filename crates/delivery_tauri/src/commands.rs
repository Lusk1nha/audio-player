use library::domain::traits::MediaRepository;
use serde::Serialize;
use tauri::State;

// Importamos os nossos módulos de negócio (O "Core" da aplicação)
use library::application::scan_directory::ScanDirectoryUseCase;
use library::infrastructure::fs_analyzer::LocalFileSystemAnalyzer;
use library::infrastructure::redb_repository::RedbMediaRepository;

// =========================================================================
// DTOs (Data Transfer Objects)
// =========================================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioMetadataDto {
    pub duration_seconds: u32,
    pub format: String,
    pub title: Option<String>,
    pub artist: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaAssetDto {
    pub id: String,
    pub path: String,
    pub category: String,
    pub metadata: AudioMetadataDto,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResultDto {
    pub scanned_files: u32,
    pub new_assets: Vec<MediaAssetDto>,
}

// =========================================================================
// COMMANDS (Os "Endpoints" do Tauri)
// =========================================================================

// Adicione junto com os outros comandos:
#[tauri::command]
pub async fn cmd_get_all_assets(repo: State<'_, RedbMediaRepository>) -> Result<String, String> {
    println!("[Backend] Buscando todas as músicas salvas no banco...");

    // 1. Busca os dados no banco usando a nossa trait do Domínio
    let assets = repo.get_all().await?;

    // 2. Mapeia para o DTO (para o JSON ficar em camelCase pro TS)
    let dto_assets: Vec<MediaAssetDto> = assets
        .into_iter()
        .map(|asset| MediaAssetDto {
            id: asset.id.to_string(),
            path: asset.path,
            category: asset.category.to_string(),
            metadata: AudioMetadataDto {
                duration_seconds: asset.metadata.duration_seconds,
                format: asset.metadata.format,
                title: asset.metadata.title,
                artist: asset.metadata.artist,
            },
        })
        .collect();

    // 3. Devolve como String JSON
    serde_json::to_string(&dto_assets).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cmd_scan_library(
    path: String,
    repo: State<'_, RedbMediaRepository>, // MAGIA DO TAURI: Injeção de Dependência automática!
) -> Result<String, String> {
    println!("[Backend] Iniciando varredura real na pasta: {}", path);

    // 1. Instanciamos a Infraestrutura (O Leitor de Arquivos)
    let analyzer = LocalFileSystemAnalyzer;

    println!("[Backend] Analisando arquivos...");

    // 2. Montamos o Use Case passando o Leitor e clonando a referência do Banco de Dados
    let use_case = ScanDirectoryUseCase {
        analyzer,
        repository: (*repo).clone(),
    };

    println!("[Backend] Executando regra de negócio...");

    // 3. Executamos a regra de negócio real! (.await porque salvar no banco é assíncrono)
    let result = use_case.execute(&path).await?;

    println!("[Backend] Mapeando entidades para DTOs...");

    // 4. Mapeamos as Entidades do Domínio (Rust puro) para os DTOs (Formato JSON pro React)
    let dto_assets: Vec<MediaAssetDto> = result
        .new_assets
        .into_iter()
        .map(|asset| MediaAssetDto {
            id: asset.id.to_string(),
            path: asset.path,
            category: asset.category.to_string(),
            metadata: AudioMetadataDto {
                duration_seconds: asset.metadata.duration_seconds,
                format: asset.metadata.format,
                title: asset.metadata.title,
                artist: asset.metadata.artist,
            },
        })
        .collect();

    println!("[Backend] Criando estrutura de resposta...");

    let result_dto = ScanResultDto {
        scanned_files: result.scanned_files,
        new_assets: dto_assets,
    };

    // 5. Serializamos para JSON e enviamos de volta pelo IPC Bridge
    serde_json::to_string(&result_dto).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_play_audio(asset_id: String) -> Result<String, String> {
    println!("[Backend] Solicitado o início do áudio ID: {}", asset_id);

    // FUTURO: Chamar o Use Case do crate `playback`

    Ok(format!(
        "Sinal enviado para o motor de áudio. Tocando {}",
        asset_id
    ))
}
