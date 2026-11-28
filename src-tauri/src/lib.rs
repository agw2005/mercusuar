use tauri::Manager;

mod db;
mod habit;
mod health;
mod ledger;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            std::fs::create_dir_all(&app_data_dir)
                .expect("failed to create app data dir");

            let db_path = app_data_dir.join("test.db");

            let pool = tauri::async_runtime::block_on(db::init_db(&db_path))
                .expect("failed to initialize database");

            app.manage(db::DbState { pool });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ledger::categories::get_all_categories,
            ledger::categories::create_category,
            ledger::categories::modify_category,
            ledger::categories::delete_category,
            ledger::accounts::get_all_accounts,
            ledger::accounts::get_account_balance,
            ledger::accounts::balances_until_date,
            ledger::accounts::create_account,
            ledger::accounts::modify_account,
            ledger::accounts::delete_account,
            ledger::contacts::get_unarchived_contacts,
            ledger::contacts::create_contact,
            ledger::contacts::get_all_claims,
            ledger::contacts::modify_contact,
            ledger::contacts::delete_contact,
            ledger::fund_types::get_all_fund_types,
            ledger::fund_types::create_fund_type,
            ledger::fund_types::modify_fund_type,
            ledger::fund_types::delete_fund_type,
            ledger::transactions::get_transactions_at_month,
            ledger::transactions::create_transaction,
            ledger::transactions::patch_transactions,
            ledger::transactions::delete_transactions,
            ledger::investments::get_unarchived_investments,
            ledger::investments::create_investment,
            ledger::investment_lots::get_all_holdings,
            ledger::investment_lots::purchase_lot,
            habit::habit_ping,
            health::health_ping
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}