use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub color: String,
    pub is_system: bool,
}

#[derive(Debug, Default, Deserialize)]
pub struct UpdateCategory {
    pub id: i64,
    pub name: Option<String>,
    pub color: Option<String>,
}

#[tauri::command]
pub async fn get_all_categories(
    state: State<'_, DbState>,
) -> Result<Vec<Category>, String> {
    sqlx::query_as::<_, Category>(
        "SELECT id, name, archived, is_system, color FROM Categories",
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

#[tauri::command]
pub async fn modify_category(
    state: State<'_, DbState>,
    data: UpdateCategory,
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
        "UPDATE Categories
         SET name = COALESCE(?, name),
             color = COALESCE(?, color)
         WHERE id = ?",
    )
    .bind(name_trimmed)
    .bind(color_trimmed)
    .bind(data.id)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Failed to modify category: {e}"))?;

    Ok(result.rows_affected())
}

#[tauri::command]
pub async fn delete_category(
    state: State<'_, DbState>,
    id: i64,
) -> Result<u64, String> {
    let result = sqlx::query(
        "DELETE FROM Categories
         WHERE id = (?)",
    )
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Failed to delete category: {e}"))?;

    Ok(result.rows_affected())
}