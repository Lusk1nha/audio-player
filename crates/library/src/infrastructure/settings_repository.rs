use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")] 
pub struct SettingsDto {
    pub theme: String,
    pub hardware_acceleration: bool,
    pub crossfade_duration_sec: u32,
}

// Valores padrão caso o arquivo ainda não exista
impl Default for SettingsDto {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            hardware_acceleration: true,
            crossfade_duration_sec: 2,
        }
    }
}

pub struct SettingsRepository {
    file_path: PathBuf,
}

impl SettingsRepository {
    pub fn new(app_data_dir: &PathBuf) -> Self {
        let mut path = app_data_dir.clone();
        path.push("config.toml"); // Define o nome do arquivo
        Self { file_path: path }
    }

    pub fn get(&self) -> Result<SettingsDto, String> {
        // Se o arquivo não existe, retornamos as configurações padrão
        if !self.file_path.exists() {
            return Ok(SettingsDto::default());
        }

        let content = fs::read_to_string(&self.file_path).map_err(|e| e.to_string())?;

        // Lê o texto TOML e converte para a Struct Rust
        toml::from_str(&content).map_err(|e| format!("Falha ao ler config.toml: {}", e))
    }

    pub fn save(&self, settings: &SettingsDto) -> Result<(), String> {
        // Converte a Struct Rust em texto TOML indentado e bonito
        let content = toml::to_string_pretty(settings).map_err(|e| e.to_string())?;

        // Salva no HD
        fs::write(&self.file_path, content).map_err(|e| e.to_string())
    }
}
