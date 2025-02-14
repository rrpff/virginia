import { app, Menu, Tray } from "electron";
import path from "path";
import os from "os";
import open from "open";
import started from "electron-squirrel-startup";
import { start } from "@virginia/server";
import isDev from "electron-is-dev";

const API_HOST = "http://localhost:26541";
const WEB_HOST = isDev ? "http://localhost:26540" : "http://localhost:26541";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

if (!isDev) {
  // Start web server in process
  start();
}

const icon =
  os.platform() === "win32"
    ? path.join(import.meta.dirname, "..", "..", "assets", "icon.ico")
    : path.join(import.meta.dirname, "..", "..", "assets", "icon-Template.png");

let tray;
app.on("ready", () => {
  const menu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: async () => {
        await open(WEB_HOST);
      },
    },
    {
      label: "Refresh",
      click: async () => {
        await fetch(`${API_HOST}/api/refresh`, { method: "POST" });
      },
    },
    {
      label: "Quit",
      click: () => {
        app.exit();
      },
    },
  ]);

  tray = new Tray(icon);
  tray.setToolTip("This is my application.");
  tray.setContextMenu(menu);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // TODO: open in browser?
});
