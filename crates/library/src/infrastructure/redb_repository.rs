use redb::{Database, ReadableDatabase, ReadableTable, TableDefinition};

use std::sync::Arc;
use tokio::task;

use super::db_models::MediaAssetRecord;
use crate::domain::entities::MediaAsset;
use crate::domain::traits::MediaRepository;

const ASSETS_TABLE: TableDefinition<&str, &[u8]> = TableDefinition::new("media_assets");

#[derive(Clone)]
pub struct RedbMediaRepository {
    // Usamos Arc para poder compartilhar a conexão do banco entre várias threads do Tokio
    db: Arc<Database>,
}

impl RedbMediaRepository {
    /// Inicializa o banco de dados criando o arquivo físico e a tabela
    pub fn new(db_path: &str) -> Result<Self, String> {
        let db = Database::create(db_path).map_err(|e| format!("Erro ao criar DB: {}", e))?;

        let write_txn = db.begin_write().map_err(|e| e.to_string())?;
        {
            let _ = write_txn
                .open_table(ASSETS_TABLE)
                .map_err(|e| e.to_string())?;
        }
        write_txn.commit().map_err(|e| e.to_string())?;

        println!("[Database] Redb inicializado com sucesso em: {}", db_path);

        Ok(Self { db: Arc::new(db) })
    }
}

// Implementamos a Trait do Domínio (A Inversão de Dependência)
impl MediaRepository for RedbMediaRepository {
    async fn save_batch(&self, assets: Vec<MediaAsset>) -> Result<(), String> {
        let db = self.db.clone();

        // Movemos o trabalho pesado para uma thread isolada para não travar o Tokio (Async)
        task::spawn_blocking(move || -> Result<(), String> {
            let write_txn = db.begin_write().map_err(|e| e.to_string())?;
            {
                let mut table = write_txn
                    .open_table(ASSETS_TABLE)
                    .map_err(|e| e.to_string())?;

                for asset in assets {
                    // 1. Converte do Domínio para o Modelo de Banco (Record)
                    let record: MediaAssetRecord = asset.into();

                    // 2. Transforma o objeto em um buffer de bytes usando JSON
                    let value_bytes = serde_json::to_vec(&record)
                        .map_err(|e| format!("Erro ao serializar: {}", e))?;

                    // 3. Salva no banco (Chave: ID da música, Valor: Buffer JSON)
                    table
                        .insert(record.id.as_str(), value_bytes.as_slice())
                        .map_err(|e| e.to_string())?;
                }
            }
            write_txn.commit().map_err(|e| e.to_string())?;

            Ok(())
        })
        .await
        .map_err(|e| format!("Erro na thread de banco de dados: {}", e))? // Trata falha do Tokio
    }

    async fn get_all(&self) -> Result<Vec<MediaAsset>, String> {
        let db = self.db.clone();

        task::spawn_blocking(move || -> Result<Vec<MediaAsset>, String> {
            let read_txn = db.begin_read().map_err(|e| e.to_string())?;
            let table = read_txn
                .open_table(ASSETS_TABLE)
                .map_err(|e| e.to_string())?;

            let mut domain_assets = Vec::new();

            // Iteramos por todos os registros da tabela
            for row in table.iter().map_err(|e| e.to_string())? {
                let (_, value) = row.map_err(|e| e.to_string())?;

                // 1. Converte o buffer de bytes de volta para o Record
                let record: MediaAssetRecord = serde_json::from_slice(value.value())
                    .map_err(|e| format!("Erro ao ler dados corrompidos: {}", e))?;

                // 2. Converte do Record de volta para a Entidade do Domínio
                domain_assets.push(record.into());
            }

            Ok(domain_assets)
        })
        .await
        .map_err(|e| format!("Erro na thread de banco de dados: {}", e))?
    }
}
