use thiserror::Error;

#[derive(Error, Debug)]
pub enum LibraryError {
    #[error("Falha ao comunicar com o banco de dados: {0}")]
    DatabaseError(String),

    #[error("Falha ao serializar/deserializar dados: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("Os dados no banco de dados estão corrompidos ou em formato inválido.")]
    DataCorruption,

    #[error("A thread assíncrona falhou: {0}")]
    TaskPanic(String),
}
