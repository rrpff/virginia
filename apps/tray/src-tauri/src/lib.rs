use std::{
    thread::{sleep, spawn},
    time::Duration,
};

use open;
use tauri::menu::{Menu, MenuItem};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            let item_open = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let item_refresh = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
            let item_quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&item_open, &item_refresh, &item_quit])?;

            let sidecar = app.shell().sidecar("virginia").unwrap();
            let (mut rx, mut _child) = sidecar.spawn().expect("Failed to spawn sidecar");

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stderr(line_bytes) = &event {
                        let line = String::from_utf8_lossy(&line_bytes);
                        log::error!("node: '{:?}'", line);
                    }

                    if let CommandEvent::Stdout(line_bytes) = &event {
                        let line = String::from_utf8_lossy(&line_bytes);
                        log::info!("node: '{:?}'", line);
                    }
                }
            });

            app.tray_by_id("tray")
                .unwrap()
                .set_menu(Some(menu))
                .unwrap();

            spawn(move || {
                sleep(Duration::from_secs(0));
                open::that("http://localhost:26541").unwrap_or_else(|error| {
                    println!("error when opening URL {:?}", error);
                });
            });

            Ok(())
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                open::that("http://localhost:26541").unwrap_or_else(|error| {
                    println!("error when opening URL {:?}", error);
                });
            }
            "refresh" => {
                let client = reqwest::blocking::Client::new();
                let _ = client.post("http://localhost:26541/api/refresh").send();
            }
            "quit" => {
                println!("Quitting");
                // TODO: actually kill sidecar on app exit
                app.exit(0);
            }
            _ => {
                println!("Unknown menu item \"{:?}\" clicked", event.id)
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
