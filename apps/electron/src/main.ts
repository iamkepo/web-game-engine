import { app, BrowserWindow } from "electron";
import path from "node:path";

const createWindow = async (): Promise<void> => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  const devUrl = process.env.WGE_EDITOR_DEV_URL;
  if (devUrl) {
    win.webContents.openDevTools();
    await win.loadURL(devUrl);
    return;
  }

  await win.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(
        "<!doctype html><html><body><h1>Editor UI not configured</h1><p>Set WGE_EDITOR_DEV_URL or implement packaging of apps/editor.</p></body></html>"
      )
  );
};

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
