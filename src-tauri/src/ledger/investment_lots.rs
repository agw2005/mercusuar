use serde::Serialize;
use tauri::State;

use crate::db::DbState;

const CATEGORY_INVESTMENT: i64 = 2;
const ACCOUNT_RECEIVABLE: i64 = 1;
const ACCOUNT_DEBT: i64 = 2;
const ACCOUNT_INVESTMENT: i64 = 3;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct InvestmentLot {
    pub id: i64,
    pub investment_id: i64,
    pub buy_transaction_id: i64,
    pub initial_quantity: f64,
    pub remaining_quantity: f64,
    pub unit_cost: f64,
    pub holding: bool,
    pub purchased_at: String,
}

#[derive(sqlx::FromRow)]
struct AssetSnapshot {
    name: String,
    current_bid: f64,
}

#[tauri::command]
pub async fn get_all_holdings(
    state: State<'_, DbState>,
) -> Result<Vec<InvestmentLot>, String> {
    sqlx::query_as::<_, InvestmentLot>(
        "SELECT id, investment_id, buy_transaction_id,
                CAST(initial_quantity AS REAL) AS initial_quantity,
                CAST(remaining_quantity AS REAL) AS remaining_quantity,
                CAST(unit_cost AS REAL) AS unit_cost,
                holding, purchased_at
         FROM Investment_Lots
         WHERE holding = 1
         ORDER BY purchased_at DESC",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Failed to fetch investment lots: {e}"))
}

#[tauri::command]
pub async fn purchase_lot(
    state: State<'_, DbState>,
    investment_id: i64,
    quantity: f64,
    unit_cost: f64,
    purchased_at: String,
    source_account: i64,
    source_contact: Option<i64>,
) -> Result<i64, String> {
    // Upfront validation before acquiring a pooled connection
    if !quantity.is_finite() || quantity <= 0.0 {
        return Err("Quantity must be greater than 0".to_string());
    }
    if !unit_cost.is_finite() || unit_cost <= 0.0 {
        return Err("Unit cost must be greater than 0".to_string());
    }
    if source_account == ACCOUNT_INVESTMENT {
        return Err("Source account cannot be the Investment account".to_string());
    }

    let needs_contact =
        source_account == ACCOUNT_DEBT || source_account == ACCOUNT_RECEIVABLE;
    if needs_contact && source_contact.is_none() {
        return Err(format!(
            "Contact is required for source_account {source_account}"
        ));
    }

    let total_cost = quantity * unit_cost;

    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| format!("Failed to start transaction: {e}"))?;

    // Fetch asset metadata to verify existence and compare current_bid
    let asset = sqlx::query_as::<_, AssetSnapshot>(
        "SELECT name, CAST(current_bid AS REAL) AS current_bid
         FROM Investments
         WHERE id = ? AND archived = 0",
    )
    .bind(investment_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| format!("Failed to query investment asset: {e}"))?
    .ok_or_else(|| format!("Active investment asset {investment_id} not found"))?;

    let description = format!("Purchase {} ({})", asset.name, quantity);

    // 1a. Source account leg (Debt increases liability; other accounts decrease)
    let source_value = if source_account == ACCOUNT_DEBT {
        total_cost
    } else {
        -total_cost
    };

    let source_tx_id = sqlx::query(
        "INSERT INTO Transactions (category_id, account_id, value, description, date)
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(CATEGORY_INVESTMENT)
    .bind(source_account)
    .bind(source_value)
    .bind(&description)
    .bind(&purchased_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Failed to insert source transaction: {e}"))?
    .last_insert_rowid();

    // 1b. Investment account leg (+total_cost)
    let buy_tx_id = sqlx::query(
        "INSERT INTO Transactions (category_id, account_id, value, description, date)
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(CATEGORY_INVESTMENT)
    .bind(ACCOUNT_INVESTMENT)
    .bind(total_cost)
    .bind(&description)
    .bind(&purchased_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Failed to insert investment transaction: {e}"))?
    .last_insert_rowid();

    // 2. Optional Debt / Receivable link (bound to source_tx_id)
    if let Some(contact_id) = source_contact {
        if source_account == ACCOUNT_RECEIVABLE {
            sqlx::query(
                "INSERT INTO Receivables (transaction_id, contact_id) VALUES (?, ?)",
            )
            .bind(source_tx_id)
            .bind(contact_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to insert receivable: {e}"))?;
        } else if source_account == ACCOUNT_DEBT {
            sqlx::query("INSERT INTO Debts (transaction_id, contact_id) VALUES (?, ?)")
                .bind(source_tx_id)
                .bind(contact_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Failed to insert debt: {e}"))?;
        }
    }

    // 3. Insert the lot (bound to buy_tx_id)
    let lot_id = sqlx::query(
        "INSERT INTO Investment_Lots (
            investment_id, buy_transaction_id, initial_quantity,
            remaining_quantity, unit_cost, holding, purchased_at
         ) VALUES (?, ?, ?, ?, ?, 1, ?)",
    )
    .bind(investment_id)
    .bind(buy_tx_id)
    .bind(quantity)
    .bind(quantity)
    .bind(unit_cost)
    .bind(&purchased_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Failed to insert investment lot: {e}"))?
    .last_insert_rowid();

    // 4. Optional asset bid price update (epsilon check avoids float noise)
    if (asset.current_bid - unit_cost).abs() > f64::EPSILON {
        sqlx::query(
            "UPDATE Investments
             SET current_bid = ?, last_updated = ?
             WHERE id = ?",
        )
        .bind(unit_cost)
        .bind(&purchased_at)
        .bind(investment_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to update investment current_bid: {e}"))?;
    }

    tx.commit()
        .await
        .map_err(|e| format!("Failed to commit lot purchase: {e}"))?;

    Ok(lot_id)
}