#[tauri::command]
pub fn health_ping() {
  println!("This function was invoked from `./src-tauri/src/health.rs` in the frontend");
}