use thiserror::Error;

#[derive(Error, Debug)]
pub enum PlaybackError {
    #[error("Arquivo de áudio não encontrado ou sem permissão de leitura.")]
    FileNotFound,
    #[error("Formato de áudio não suportado ou arquivo corrompido.")]
    UnsupportedFormat,
    #[error("Falha ao comunicar com a placa de som do sistema: {0}")]
    DeviceError(String),
    #[error("O motor de áudio travou ou está inacessível (Thread Panic).")]
    EngineLockFailed,
    #[error("Falha ao pular tempo da música: {0}")]
    SeekFailed(String),
}