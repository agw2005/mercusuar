use serde::Serialize;
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Account {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub is_system: bool,
}

#[tauri::command]
pub async fn get_all_accounts(
    state: State<'_, DbState>,
) -> Result<Vec<Account>, String> {
    sqlx::query_as::<_, Account>(
        "SELECT id, name, archived, is_system FROM Accounts",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch accounts: {e}"))
}

#[tauri::command]
pub async fn create_account(
    state: State<'_, DbState>,
    name: String,
) -> Result<i64, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Account name cannot be empty".to_string());
    }

    let result = sqlx::query("INSERT INTO Accounts (name) VALUES (?)")
        .bind(trimmed)
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Failed to create account: {e}"))?;

    Ok(result.last_insert_rowid())
}