use thiserror::Error;

#[derive(Error, Debug)]
pub enum IntelligenceError {
    #[error("Modelo de IA não encontrado na pasta de complementos.")]
    EngineMissing,

    #[error("Falha ao inicializar o motor de IA: {0}")]
    EngineInitializationFailed(String), // Adicionado para corrigir o erro de compilação

    #[error("Falha ao processar áudio: {0}")]
    ProcessingError(String),

    #[error("A transcrição foi cancelada ou falhou: {0}")]
    TranscriptionFailed(String),
    
    #[error("Formato de áudio inválido para Whisper (necessário 16kHz Mono)")]
    InvalidAudioFormat,

    #[error("Erro de I/O: {0}")]
    IoError(#[from] std::io::Error),
}