use open;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let item_open = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let item_quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&item_open, &item_quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone()) // TODO: change
                .build(app)?;

            Ok(())
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                open::that("https://bsky.app").unwrap_or_else(|error| {
                    println!("error when opening URL {:?}", error);
                });
            }
            "quit" => {
                println!("Quitting");
                app.exit(0);
            }
            _ => {
                println!("Unknown menu item \"{:?}\" clicked", event.id)
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
