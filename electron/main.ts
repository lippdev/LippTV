import path from "node:path";
import { app, BrowserWindow } from "electron";
import { registerIpc } from "./ipc";
import { configurePlaybackSession } from "./sessionPlayback";
import { logger } from "./utils/logger";

const isDev = !app.isPackaged;
const iconPath = path.join(app.getAppPath(), "assets", process.platform === "win32" ? "logo.ico" : "logo.png");

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: "#07111f",
    frame: false,
    titleBarStyle: "hidden",
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const emitMaximized = () => {
    win.webContents.send("window:maximized-changed", win.isMaximized());
  };

  win.on("maximize", emitMaximized);
  win.on("unmaximize", emitMaximized);
  win.on("enter-full-screen", emitMaximized);
  win.on("leave-full-screen", emitMaximized);

  if (isDev) {
    await win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }

  win.webContents.once("did-finish-load", emitMaximized);
}

app.whenReady().then(async () => {
  configurePlaybackSession();
  registerIpc();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
});
