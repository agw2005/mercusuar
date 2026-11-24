use serde::{Serialize};
use tauri::State;

use crate::db::DbState;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Investment {
    pub id: i64,
    pub fund_type_id: i64,
    pub name: String,
    pub unit: String,
    pub current_bid: f64,
    pub last_updated: String,
    pub archived: bool,
}

#[tauri::command]
pub async fn get_unarchived_investments(
    state: State<'_, DbState>,
) -> Result<Vec<Investment>, String> {
    sqlx::query_as::<_, Investment>(
        "SELECT id, fund_type_id, name, unit, current_bid, last_updated, archived
         FROM Investments
         WHERE archived = 0",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch transactions: {e}"))
}

#[tauri::command]
pub async fn create_investment(
    state: State<'_, DbState>,
    fund_type_id: i64,
    name: String,
    unit: String,
    current_bid: i64,
    last_updated: String,
) -> Result<i64, String> {
    let trimmed_name = name.trim();
    let trimmed_unit = unit.trim();
    if trimmed_name.is_empty() {
        return Err("Investment name cannot be empty".to_string());
    }
    if trimmed_unit.is_empty() {
        return Err("Investment unit cannot be empty".to_string());
    }

    let result: sqlx::sqlite::SqliteQueryResult = sqlx::query("
            INSERT INTO Investments
                (fund_type_id, name, unit, current_bid, last_updated)
            VALUES (?,?,?,?,?)")
        .bind(fund_type_id)
        .bind(trimmed_name)
        .bind(trimmed_unit)
        .bind(current_bid)
        .bind(&last_updated)
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Failed to create investment: {e}"))?;

    Ok(result.last_insert_rowid())
}