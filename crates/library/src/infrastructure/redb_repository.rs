use async_trait::async_trait;

use redb::{Database, ReadableDatabase, ReadableTable, TableDefinition};
use std::sync::Arc;
use tokio::task;

use super::db_models::MediaAssetRecord;
use crate::domain::entities::MediaAsset;
use crate::domain::errors::LibraryError;
use crate::domain::traits::MediaRepository;

const ASSETS_TABLE: TableDefinition<&str, &[u8]> = TableDefinition::new("media_assets");

#[derive(Clone)]
pub struct RedbMediaRepository {
    db: Arc<Database>,
}

impl RedbMediaRepository {
    pub fn new(db_path: &str) -> Result<Self, LibraryError> {
        let db =
            Database::create(db_path).map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

        let write_txn = db
            .begin_write()
            .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
        {
            let _ = write_txn
                .open_table(ASSETS_TABLE)
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
        }
        write_txn
            .commit()
            .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

        println!("[Database] Redb inicializado com sucesso em: {}", db_path);

        Ok(Self { db: Arc::new(db) })
    }
}

#[async_trait]
impl MediaRepository for RedbMediaRepository {
    async fn save_batch(&self, assets: Vec<MediaAsset>) -> Result<(), LibraryError> {
        let db = self.db.clone();

        task::spawn_blocking(move || -> Result<(), LibraryError> {
            let write_txn = db
                .begin_write()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
            {
                let mut table = write_txn
                    .open_table(ASSETS_TABLE)
                    .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

                for asset in assets {
                    let record: MediaAssetRecord = asset.into();
                    let value_bytes = serde_json::to_vec(&record)?; // ? funciona graças ao #[from] no LibraryError

                    table
                        .insert(record.id.as_str(), value_bytes.as_slice())
                        .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
                }
            }
            write_txn
                .commit()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

            Ok(())
        })
        .await
        .map_err(|e| LibraryError::TaskPanic(e.to_string()))?
    }

    async fn get_all(&self) -> Result<Vec<MediaAsset>, LibraryError> {
        let db = self.db.clone();

        task::spawn_blocking(move || -> Result<Vec<MediaAsset>, LibraryError> {
            let read_txn = db
                .begin_read()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
            let table = read_txn
                .open_table(ASSETS_TABLE)
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

            let mut domain_assets = Vec::new();

            for row in table
                .iter()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?
            {
                let (_, value) = row.map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

                let record: MediaAssetRecord = serde_json::from_slice(value.value())?;

                // Converte e trata o erro se o UUID no banco estiver corrompido
                let asset =
                    MediaAsset::try_from(record).map_err(|_| LibraryError::DataCorruption)?;

                domain_assets.push(asset);
            }

            Ok(domain_assets)
        })
        .await
        .map_err(|e| LibraryError::TaskPanic(e.to_string()))?
    }

    async fn remove(&self, asset_id: &str) -> Result<(), LibraryError> {
        let db = self.db.clone();
        let id = asset_id.to_string();

        task::spawn_blocking(move || -> Result<(), LibraryError> {
            let write_txn = db
                .begin_write()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
            {
                let mut table = write_txn
                    .open_table(ASSETS_TABLE)
                    .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

                table
                    .remove(id.as_str())
                    .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
            }
            write_txn
                .commit()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

            Ok(())
        })
        .await
        .map_err(|e| LibraryError::TaskPanic(e.to_string()))?
    }
}
