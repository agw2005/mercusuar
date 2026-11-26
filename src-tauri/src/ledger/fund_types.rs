use serde::Serialize;
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct FundType {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub color: String,
}

#[tauri::command]
pub async fn get_unarchived_fund_types(
    state: State<'_, DbState>,
) -> Result<Vec<FundType>, String> {
    sqlx::query_as::<_, FundType>(
        "SELECT id, name, archived, color FROM Fund_Types WHERE archived = 0",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch fund types: {e}"))
}

#[tauri::command]
pub async fn create_fund_type(
    state: State<'_, DbState>,
    name: String,
) -> Result<i64, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Fund type name cannot be empty".to_string());
    }

    let result = sqlx::query("INSERT INTO Fund_Types (name) VALUES (?)")
        .bind(trimmed)
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Failed to create fund type: {e}"))?;

    Ok(result.last_insert_rowid())
}