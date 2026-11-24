use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    SqlitePool,
};
use std::path::Path;

pub struct DbState {
    pub pool: SqlitePool,
}

pub async fn init_db(db_path: &Path) -> Result<SqlitePool, sqlx::Error> {
    let options = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    // Run your existing schema + triggers + seed data
    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}