// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod fonts_cfg;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            fonts_cfg::read_fonts_cfg,
            fonts_cfg::write_fonts_cfg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
