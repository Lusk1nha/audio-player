use async_trait::async_trait;

use redb::{Database, ReadableDatabase, ReadableTable, TableDefinition};
use std::sync::Arc;
use tokio::task;

use super::db_models::MediaAssetRecord;
use crate::domain::entities::MediaAsset;
use crate::domain::errors::LibraryError;
use crate::domain::traits::{MediaRepository, SortBy, SortOrder};

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

    async fn search(
        &self,
        query: &str,
        sort_by: SortBy,
        sort_order: SortOrder,
    ) -> Result<Vec<MediaAsset>, LibraryError> {
        let db = self.db.clone();

        // Clonamos as strings para poder mover (move) para dentro da thread do tokio
        let query_lower = query.to_lowercase();

        task::spawn_blocking(move || -> Result<Vec<MediaAsset>, LibraryError> {
            let read_txn = db
                .begin_read()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
            let table = read_txn
                .open_table(ASSETS_TABLE)
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?;

            let mut filtered_assets = Vec::new();

            // 1. FILTRAGEM
            for row in table
                .iter()
                .map_err(|e| LibraryError::DatabaseError(e.to_string()))?
            {
                let (_, value) = row.map_err(|e| LibraryError::DatabaseError(e.to_string()))?;
                let record: MediaAssetRecord = serde_json::from_slice(value.value())?;
                let asset =
                    MediaAsset::try_from(record).map_err(|_| LibraryError::DataCorruption)?;

                let matches = if query_lower.is_empty() {
                    true
                } else {
                    let title = asset.metadata.title.as_deref().unwrap_or("").to_lowercase();
                    let artist = asset
                        .metadata
                        .artist
                        .as_deref()
                        .unwrap_or("")
                        .to_lowercase();
                    let path = asset.path.to_lowercase();

                    title.contains(&query_lower)
                        || artist.contains(&query_lower)
                        || path.contains(&query_lower)
                };

                if matches {
                    filtered_assets.push(asset);
                }
            }

            // 2. ORDENAÇÃO
            filtered_assets.sort_by(|a, b| {
                let cmp = match sort_by {
                    SortBy::Title => {
                        let val_a = a.metadata.title.as_deref().unwrap_or(&a.path);
                        let val_b = b.metadata.title.as_deref().unwrap_or(&b.path);
                        val_a.to_lowercase().cmp(&val_b.to_lowercase())
                    }
                    SortBy::Artist => {
                        let val_a = a.metadata.artist.as_deref().unwrap_or("zzzz");
                        let val_b = b.metadata.artist.as_deref().unwrap_or("zzzz");
                        val_a.to_lowercase().cmp(&val_b.to_lowercase())
                    }
                    SortBy::Duration => {
                        let val_a = a.metadata.duration_seconds;
                        let val_b = b.metadata.duration_seconds;

                        val_a
                            .partial_cmp(&val_b)
                            .unwrap_or(std::cmp::Ordering::Equal)
                    }
                    _ => a.id.to_string().cmp(&b.id.to_string()),
                };

                if sort_order == SortOrder::Descending {
                    cmp.reverse()
                } else {
                    cmp
                }
            });

            Ok(filtered_assets)
        })
        .await
        .map_err(|e| LibraryError::TaskPanic(e.to_string()))?
    }
}
