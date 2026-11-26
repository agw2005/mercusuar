use serde::Serialize;
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Contact {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub color: String,
}

#[tauri::command]
pub async fn get_unarchived_contacts(
    state: State<'_, DbState>,
) -> Result<Vec<Contact>, String> {
    sqlx::query_as::<_, Contact>(
        "SELECT id, name, archived, color FROM Contacts WHERE archived = 0",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch contacts: {e}"))
}

#[tauri::command]
pub async fn create_contact(
    state: State<'_, DbState>,
    name: String,
) -> Result<i64, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Contact name cannot be empty".to_string());
    }

    let result = sqlx::query("INSERT INTO Contacts (name) VALUES (?)")
        .bind(trimmed)
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Failed to create contact: {e}"))?;

    Ok(result.last_insert_rowid())
}