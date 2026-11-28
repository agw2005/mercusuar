use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct FundType {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub color: String,
}

#[derive(Debug, Default, Deserialize)]
pub struct UpdateFundType {
    pub id: i64,
    pub name: Option<String>,
    pub color: Option<String>,
}

#[tauri::command]
pub async fn get_all_fund_types(
    state: State<'_, DbState>,
) -> Result<Vec<FundType>, String> {
    sqlx::query_as::<_, FundType>(
        "SELECT id, name, archived, color FROM Fund_Types",
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

#[tauri::command]
pub async fn modify_fund_type(
    state: State<'_, DbState>,
    data: UpdateFundType,
) -> Result<u64, String> {
    let name_trimmed = data
        .name
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty());

    let color_trimmed = data
        .color
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty());

    let result = sqlx::query(
        "UPDATE Fund_Types
         SET name = COALESCE(?, name),
             color = COALESCE(?, color)
         WHERE id = ?",
    )
    .bind(name_trimmed)
    .bind(color_trimmed)
    .bind(data.id)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Failed to modify fund type: {e}"))?;

    Ok(result.rows_affected())
}

#[tauri::command]
pub async fn delete_fund_type(
    state: State<'_, DbState>,
    id: i64,
) -> Result<u64, String> {
    let result = sqlx::query(
        "DELETE FROM Fund_Types
         WHERE id = (?)",
    )
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Failed to delete fund type: {e}"))?;

    Ok(result.rows_affected())
}