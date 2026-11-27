use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Contact {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub color: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Claim {
    #[serde(rename = "type")]
    pub claim_type: String,
    pub id: i64,
    pub transaction_id: i64,
    pub contact_id: i64,
    pub name: String,
    pub date: String,
    pub description: String,
    pub value: f64,
}

#[derive(Debug, Default, Deserialize)]
pub struct UpdateContact {
    pub id: i64,
    pub name: Option<String>,
    pub color: Option<String>,
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

#[tauri::command]
pub async fn get_all_claims(
    state: State<'_, DbState>,
) -> Result<Vec<Claim>, String> {
    sqlx::query_as::<_, Claim>(
        "SELECT
            'r' AS claim_type,
            r.id,
            r.transaction_id,
            r.contact_id,
            c.name,
            t.date,
            COALESCE(t.description, '') AS description,
            CAST(t.value AS REAL) AS value
         FROM Receivables r
         INNER JOIN Transactions t ON r.transaction_id = t.id
         INNER JOIN Contacts c ON r.contact_id = c.id

         UNION ALL

         SELECT
            'd' AS claim_type,
            d.id,
            d.transaction_id,
            d.contact_id,
            c.name,
            t.date,
            COALESCE(t.description, '') AS description,
            CAST(t.value AS REAL) AS value
         FROM Debts d
         INNER JOIN Transactions t ON d.transaction_id = t.id
         INNER JOIN Contacts c ON d.contact_id = c.id

         ORDER BY date ASC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch claims: {e}"))
}

#[tauri::command]
pub async fn modify_contact(
    state: State<'_, DbState>,
    data: UpdateContact,
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
        "UPDATE Contacts
         SET name = COALESCE(?, name),
             color = COALESCE(?, color)
         WHERE id = ?",
    )
    .bind(name_trimmed)
    .bind(color_trimmed)
    .bind(data.id)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Failed to modify contact: {e}"))?;

    Ok(result.rows_affected())
}