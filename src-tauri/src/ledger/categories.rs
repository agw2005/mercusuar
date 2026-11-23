use serde::Serialize;
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub is_system: bool,
}

#[tauri::command]
pub async fn get_unarchived_categories(
    state: State<'_, DbState>,
) -> Result<Vec<Category>, String> {
    sqlx::query_as::<_, Category>(
        "SELECT id, name, archived, is_system FROM Categories WHERE archived = 0",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch categories: {e}"))
}

#[tauri::command]
pub async fn create_category(
    state: State<'_, DbState>,
    name: String,
) -> Result<i64, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Category name cannot be empty".to_string());
    }

    let result = sqlx::query("INSERT INTO Categories (name) VALUES (?)")
        .bind(trimmed)
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Failed to create category: {e}"))?;

    Ok(result.last_insert_rowid())
}