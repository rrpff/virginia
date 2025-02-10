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
            let item_refresh = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
            let item_quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&item_open, &item_refresh, &item_quit])?;

            // #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .build(app)?;

            Ok(())
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                open::that("http://localhost:26540").unwrap_or_else(|error| {
                    println!("error when opening URL {:?}", error);
                });
            }
            "refresh" => {
                let client = reqwest::blocking::Client::new();
                let _ = client.post("http://localhost:26541/api/refresh").send();
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
