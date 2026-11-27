use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbState;

const CATEGORY_TRANSFER: i64 = 1;
const ACCOUNT_RECEIVABLE: i64 = 1;
const ACCOUNT_DEBT: i64 = 2;
const ACCOUNT_INVESTMENT: i64 = 3;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Account {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub is_system: bool,
    pub color: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct AccountBalance {
    pub id: i64,
    pub name: String,
    pub archived: bool,
    pub is_system: bool,
    pub color: String,
    pub balance: f64,
}

#[derive(Debug, Default, Deserialize)]
pub struct UpdateAccount {
    pub id: i64,
    pub name: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteAccountPayload {
    pub id: i64,
    pub destination_account_id: Option<i64>,
    pub contact_id: Option<i64>,
    pub date: String,
}

#[derive(sqlx::FromRow)]
struct AccountCloseSnapshot {
    name: String,
    is_system: bool,
    balance: f64,
}

#[tauri::command]
pub async fn balances_until_date(
    state: State<'_, DbState>,
    start: String,
) -> Result<Vec<AccountBalance>, String> {
    sqlx::query_as::<_, AccountBalance>(
        "SELECT
            a.id,
            a.name,
            a.archived,
            a.is_system,
            a.color,
            CAST(COALESCE(SUM(t.value), 0) AS REAL) AS balance
        FROM Accounts a
        LEFT JOIN Transactions t
            ON t.account_id = a.id
        AND t.date < ?
        GROUP BY
            a.id,
            a.name,
            a.archived,
            a.is_system
        ORDER BY a.id;",
    )
    .bind(&start)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch balances per account: {e}"))
}

#[tauri::command]
pub async fn get_all_accounts(
    state: State<'_, DbState>,
) -> Result<Vec<Account>, String> {
    sqlx::query_as::<_, Account>(
        "SELECT id, name, archived, is_system, color FROM Accounts",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch accounts: {e}"))
}

#[tauri::command]
pub async fn get_account_balance(
    state: State<'_, DbState>,
    id: i64,
) -> Result<AccountBalance, String> {
    sqlx::query_as::<_, AccountBalance>(
        "SELECT
            a.id,
            a.name,
            a.archived,
            a.is_system,
            a.color,
            CAST(COALESCE(SUM(t.value), 0) AS REAL) AS balance
        FROM Accounts a
        LEFT JOIN Transactions t
            ON t.account_id = a.id
        WHERE a.id = ?
        GROUP BY a.id",
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch balance: {e}"))
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

#[tauri::command]
pub async fn modify_account(
    state: State<'_, DbState>,
    data: UpdateAccount,
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
        "UPDATE Accounts
         SET name = COALESCE(?, name),
             color = COALESCE(?, color)
         WHERE id = ?",
    )
    .bind(name_trimmed)
    .bind(color_trimmed)
    .bind(data.id)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Failed to modify account: {e}"))?;

    Ok(result.rows_affected())
}

#[tauri::command]
pub async fn delete_account(
    state: State<'_, DbState>,
    data: DeleteAccountPayload,
) -> Result<u64, String> {
    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {e}"))?;

    let account = sqlx::query_as::<_, AccountCloseSnapshot>(
        "SELECT
            a.name,
            a.is_system,
            CAST(COALESCE(SUM(t.value), 0) AS REAL) AS balance
         FROM Accounts a
         LEFT JOIN Transactions t ON t.account_id = a.id
         WHERE a.id = ?
         GROUP BY a.id",
    )
    .bind(data.id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| format!("Failed to fetch account snapshot: {e}"))?
    .ok_or_else(|| format!("Account {} not found", data.id))?;

    if account.is_system {
        return Err("Default accounts cannot be deleted".to_string());
    }

    if account.balance.abs() > f64::EPSILON {
        let dest_id = data
            .destination_account_id
            .ok_or_else(|| "Destination account is required for non-zero balance".to_string())?;

        if dest_id == data.id {
            return Err("Destination account cannot be the same as the closing account".to_string());
        }
        if dest_id == ACCOUNT_INVESTMENT {
            return Err("Cannot transfer closing balance directly to Investment account".to_string());
        }

        let needs_contact = dest_id == ACCOUNT_RECEIVABLE || dest_id == ACCOUNT_DEBT;
        if needs_contact && data.contact_id.is_none() {
            return Err(format!("Contact is required for destination account {dest_id}"));
        }

        let description = format!("Close {} account", account.name);

        sqlx::query(
            "INSERT INTO Transactions (category_id, account_id, value, description, date)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(CATEGORY_TRANSFER)
        .bind(data.id)
        .bind(-account.balance)
        .bind(&description)
        .bind(&data.date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert closing source transaction: {e}"))?;

        let dest_value = if dest_id == ACCOUNT_DEBT {
            -account.balance
        } else {
            account.balance
        };

        let dest_tx_id = sqlx::query(
            "INSERT INTO Transactions (category_id, account_id, value, description, date)
             VALUES (?, ?, ?, ?, ?)",
        )
        .bind(CATEGORY_TRANSFER)
        .bind(dest_id)
        .bind(dest_value)
        .bind(&description)
        .bind(&data.date)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert closing destination transaction: {e}"))?
        .last_insert_rowid();

        if let Some(contact_id) = data.contact_id {
            if dest_id == ACCOUNT_RECEIVABLE {
                sqlx::query(
                    "INSERT INTO Receivables (transaction_id, contact_id) VALUES (?, ?)",
                )
                .bind(dest_tx_id)
                .bind(contact_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Failed to insert receivable: {e}"))?;
            } else if dest_id == ACCOUNT_DEBT {
                sqlx::query("INSERT INTO Debts (transaction_id, contact_id) VALUES (?, ?)")
                    .bind(dest_tx_id)
                    .bind(contact_id)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| format!("Failed to insert debt: {e}"))?;
            }
        }
    }

    let result = sqlx::query("DELETE FROM Accounts WHERE id = ?")
        .bind(data.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to delete account: {e}"))?;

    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit account deletion: {e}"))?;

    Ok(result.rows_affected())
}