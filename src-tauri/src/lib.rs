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

            let pool = tauri::async_runtime::block_on(db::init_ledger(&db_path))
                .expect("failed to initialize database");

            app.manage(db::DbState { pool });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ledger::categories::get_all_categories,
            ledger::categories::create_category,
            ledger::accounts::get_all_accounts,
            ledger::accounts::balances_until_date,
            ledger::accounts::create_account,
            ledger::contacts::get_unarchived_contacts,
            ledger::contacts::create_contact,
            ledger::fund_types::get_unarchived_fund_types,
            ledger::fund_types::create_fund_type,
            ledger::transactions::get_transactions_at_month,
            ledger::transactions::create_transaction,
            habit::habit_ping,
            health::health_ping
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}