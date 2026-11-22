#[tauri::command]
pub fn ledger_ping() {
  println!("This function was invoked from `./src-tauri/src/ledger.rs` in the frontend");
}