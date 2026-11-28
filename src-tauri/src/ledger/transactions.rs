use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbState;

const ACCOUNT_RECEIVABLE: i64 = 1;
const ACCOUNT_DEBT: i64 = 2;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Transaction {
    pub id: i64,
    pub category_id: i64,
    pub account_id: i64,
    pub value: f64,
    pub description: Option<String>,
    pub date: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountChange {
    pub account_id: i64,
    pub value: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAccountChange {
    pub transaction_id: i64,
    pub account_id: i64,
    pub value: f64,
}

#[tauri::command]
pub async fn get_transactions_at_month(
    state: State<'_, DbState>,
    start: String,
    end: String,
) -> Result<Vec<Transaction>, String> {
    sqlx::query_as::<_, Transaction>(
        "SELECT id, category_id, account_id, CAST(value AS REAL) AS value, description, date
         FROM Transactions
         WHERE date >= ? AND date < ?",
    )
    .bind(start)
    .bind(end)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch transactions: {e}"))
}

#[tauri::command]
pub async fn create_transaction(
    state: State<'_, DbState>,
    category: i64,
    changes: Vec<AccountChange>,
    contact: Option<i64>,
    description: String,
    date: String,
) -> Result<Vec<i64>, String> {
    if changes.is_empty() {
        return Err("At least one account change is required".to_string());
    }

    for change in &changes {
        let needs_contact =
            change.account_id == ACCOUNT_RECEIVABLE || change.account_id == ACCOUNT_DEBT;
        if needs_contact && contact.is_none() {
            return Err(format!(
                "Contact is required for account_id {}",
                change.account_id
            ));
        }
    }

    // Initiate BEGIN
    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {e}"))?;

    let mut inserted_ids = Vec::with_capacity(changes.len());

    for change in changes {
        let result = sqlx::query(
            "INSERT INTO Transactions (category_id, account_id, value, description, date)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(category)
        .bind(change.account_id)
        .bind(change.value)
        .bind(&description)
        .bind(&date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert transaction: {e}"))?;

        let transaction_id = result.last_insert_rowid();
        inserted_ids.push(transaction_id);

        if let Some(contact_id) = contact {
            if change.account_id == ACCOUNT_RECEIVABLE {
                sqlx::query(
                    "INSERT INTO Receivables (transaction_id, contact_id) VALUES (?, ?)",
                )
                .bind(transaction_id)
                .bind(contact_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Failed to insert receivable: {e}"))?;
            } else if change.account_id == ACCOUNT_DEBT {
                sqlx::query("INSERT INTO Debts (transaction_id, contact_id) VALUES (?, ?)")
                    .bind(transaction_id)
                    .bind(contact_id)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| format!("Failed to insert debt: {e}"))?;
            }
        }
    }

    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit transaction: {e}"))?;

    Ok(inserted_ids)
}

#[tauri::command]
pub async fn patch_transactions(
    state: State<'_, DbState>,
    transactions_date: String,
    category_id: i64,
    changes: Vec<UpdateAccountChange>,
    contact_id: Option<i64>,
    description: String,
) -> Result<u64, String> {
    if changes.is_empty() {
        return Err("At least one transaction change is required".to_string());
    }

    for change in &changes {
        if !change.value.is_finite() {
            return Err("Transaction value must be a finite number".to_string());
        }
        let needs_contact =
            change.account_id == ACCOUNT_RECEIVABLE || change.account_id == ACCOUNT_DEBT;
        if needs_contact && contact_id.is_none() {
            return Err(format!(
                "Contact is required for account_id {}",
                change.account_id
            ));
        }
    }

    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {e}"))?;

    let mut total_updated: u64 = 0;

    for change in changes {
        let result = sqlx::query(
            "UPDATE Transactions
             SET category_id = ?, value = ?, description = ?
             WHERE id = ? AND date = ?",
        )
        .bind(category_id)
        .bind(change.value)
        .bind(&description)
        .bind(change.transaction_id)
        .bind(&transactions_date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to update transaction {}: {e}", change.transaction_id))?;

        if result.rows_affected() == 0 {
            return Err(format!(
                "Transaction #{} at date {} not found",
                change.transaction_id, transactions_date
            ));
        }
        total_updated += result.rows_affected();

        if let Some(cid) = contact_id {
            if change.account_id == ACCOUNT_RECEIVABLE {
                sqlx::query(
                    "UPDATE Receivables SET contact_id = ? WHERE transaction_id = ?",
                )
                .bind(cid)
                .bind(change.transaction_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Failed to update receivable: {e}"))?;
            } else if change.account_id == ACCOUNT_DEBT {
                sqlx::query("UPDATE Debts SET contact_id = ? WHERE transaction_id = ?")
                    .bind(cid)
                    .bind(change.transaction_id)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| format!("Failed to update debt: {e}"))?;
            }
        }
    }

    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit transaction updates: {e}"))?;

    Ok(total_updated)
}

#[tauri::command]
pub async fn delete_transactions(
    state: State<'_, DbState>,
    transactions_date: String,
    transaction_ids: Vec<i64>,
) -> Result<u64, String> {
    if transaction_ids.is_empty() {
        return Err("At least one transaction ID is required".to_string());
    }

    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {e}"))?;

    let mut total_deleted: u64 = 0;

    for id in &transaction_ids {
        let result = sqlx::query(
            "DELETE FROM Transactions WHERE id = ? AND date = ?",
        )
        .bind(id)
        .bind(&transactions_date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to delete transaction {id}: {e}"))?;

        if result.rows_affected() == 0 {
            return Err(format!(
                "Transaction {id} at date {transactions_date} not found"
            ));
        }
        total_deleted += result.rows_affected();
    }

    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit transaction deletion: {e}"))?;

    Ok(total_deleted)
}