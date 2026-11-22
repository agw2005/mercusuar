#[tauri::command]
pub fn habit_ping() {
  println!("This function was invoked from `./src-tauri/src/habit.rs` in the frontend");
}