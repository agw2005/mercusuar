use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbState;

const CATEGORY_TRANSFER: i64 = 1;
const ACCOUNT_RECEIVABLE: i64 = 1;
const ACCOUNT_DEBT: i64 = 2;
const ACCOUNT_INVESTMENT: i64 = 3;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Contact {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub color: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Claim {
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

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteContactPayload {
    pub id: i64,
    pub destination_account_id: Option<i64>,
    pub date: String,
}

#[derive(sqlx::FromRow)]
struct ContactCloseSnapshot {
    name: String,
    receivable_total: f64,
    debt_total: f64,
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

#[tauri::command]
pub async fn delete_contact(
    state: State<'_, DbState>,
    data: DeleteContactPayload,
) -> Result<u64, String> {
    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {e}"))?;

    let contact = sqlx::query_as::<_, ContactCloseSnapshot>(
        "SELECT
            c.name,
            CAST(COALESCE((
                SELECT SUM(t.value)
                FROM Receivables r
                INNER JOIN Transactions t ON r.transaction_id = t.id
                WHERE r.contact_id = c.id
            ), 0) AS REAL) AS receivable_total,
            CAST(COALESCE((
                SELECT SUM(t.value)
                FROM Debts d
                INNER JOIN Transactions t ON d.transaction_id = t.id
                WHERE d.contact_id = c.id
            ), 0) AS REAL) AS debt_total
         FROM Contacts c
         WHERE c.id = ?",
    )
    .bind(data.id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| format!("Failed to fetch contact snapshot: {e}"))?
    .ok_or_else(|| format!("Contact {} not found", data.id))?;

    let net_transfer = contact.receivable_total - contact.debt_total;
    let description = format!("Settle and close contact {}", contact.name);

    let dest_id = if net_transfer.abs() > f64::EPSILON {
        let id = data
            .destination_account_id
            .ok_or_else(|| "Destination account is required for non-zero obligation".to_string())?;

        if id == ACCOUNT_INVESTMENT || id == ACCOUNT_DEBT || id == ACCOUNT_RECEIVABLE {
            return Err(
                "Destination account must not be a systems default".to_string(),
            );
        }
        Some(id)
    } else {
        None
    };

    if contact.receivable_total.abs() > f64::EPSILON {
        let rec_tx_id = sqlx::query(
            "INSERT INTO Transactions (category_id, account_id, value, description, date)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(CATEGORY_TRANSFER)
        .bind(ACCOUNT_RECEIVABLE)
        .bind(-contact.receivable_total)
        .bind(&description)
        .bind(&data.date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert receivable settlement transaction: {e}"))?
        .last_insert_rowid();

        sqlx::query("INSERT INTO Receivables (transaction_id, contact_id) VALUES (?, ?)")
            .bind(rec_tx_id)
            .bind(data.id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to link receivable settlement: {e}"))?;
    }

    if contact.debt_total.abs() > f64::EPSILON {
        let debt_tx_id = sqlx::query(
            "INSERT INTO Transactions (category_id, account_id, value, description, date)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(CATEGORY_TRANSFER)
        .bind(ACCOUNT_DEBT)
        .bind(-contact.debt_total)
        .bind(&description)
        .bind(&data.date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert debt settlement transaction: {e}"))?
        .last_insert_rowid();

        sqlx::query("INSERT INTO Debts (transaction_id, contact_id) VALUES (?, ?)")
            .bind(debt_tx_id)
            .bind(data.id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to link debt settlement: {e}"))?;
    }

    if let Some(dest_account_id) = dest_id {
        sqlx::query(
            "INSERT INTO Transactions (category_id, account_id, value, description, date)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(CATEGORY_TRANSFER)
        .bind(dest_account_id)
        .bind(net_transfer)
        .bind(&description)
        .bind(&data.date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert destination settlement transaction: {e}"))?;
    }

    let result = sqlx::query("DELETE FROM Contacts WHERE id = ?")
        .bind(data.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to delete contact: {e}"))?;

    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit contact deletion: {e}"))?;

    Ok(result.rows_affected())
}