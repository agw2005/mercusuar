use tauri_plugin_sql::{Migration, MigrationKind};
mod habit;
mod health;
mod ledger;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../sql/ledger.sql"),
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new()
        .add_migrations("sqlite:test.db", migrations)
        .build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            ledger::ledger_ping,
            habit::habit_ping,
            health::health_ping
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
