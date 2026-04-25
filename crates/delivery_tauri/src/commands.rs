use serde::Serialize;

// =========================================================================
// DTOs (Data Transfer Objects)
// Estas estruturas espelham perfeitamente os schemas do Zod no frontend.
// =========================================================================

#[derive(Serialize)]
#[serde(rename_all = "camelCase")] // MAGIA: Converte duration_seconds do Rust para durationSeconds no TS!
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

#[tauri::command]
pub fn cmd_scan_library(path: String) -> Result<String, String> {
    println!("[Backend] Iniciando varredura na pasta: {}", path);

    // FUTURO: Aqui chamaremos o Use Case do crate `library`
    // let use_case = state.library_use_cases.scan_directory;
    // let result = use_case.execute(&path)?;

    // MOCK: Simulando o retorno que o banco de dados daria
    let mock_asset = MediaAssetDto {
        id: "123e4567-e89b-12d3-a456-426614174000".to_string(),
        path: format!("{}/minha_musica_incrivel.mp3", path),
        category: "Music".to_string(),
        metadata: AudioMetadataDto {
            duration_seconds: 215,
            format: "mp3".to_string(),
            title: Some("Sinfonia do Rust".to_string()),
            artist: Some("Tauri Band".to_string()),
        },
    };

    let result = ScanResultDto {
        scanned_files: 1,
        new_assets: vec![mock_asset],
    };

    // Converte a struct Rust em uma String JSON para o React fazer o parse() e o Zod validar
    serde_json::to_string(&result).map_err(|e| e.to_string())
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
