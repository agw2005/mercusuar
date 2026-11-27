use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbState;

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
    id: i64,
) -> Result<u64, String> {
    let result = sqlx::query(
        "DELETE FROM Accounts
         WHERE id = (?)",
    )
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Failed to delete account: {e}"))?;

    Ok(result.rows_affected())
}