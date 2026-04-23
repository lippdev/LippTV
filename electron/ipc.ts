import { BrowserWindow, dialog, ipcMain } from "electron";
import type {
  FavoriteRecord,
  HistoryRecord,
  ImportInput,
  PlaybackState,
  ThemeMode
} from "@shared/types";
import { fetchXtreamSeriesEpisodes } from "./services/connectors/xtream";
import { importSource, refreshSource } from "./services/importService";
import { appStore } from "./services/store";

export function registerIpc() {
  ipcMain.handle("app:snapshot", () => appStore.getSnapshot());

  ipcMain.handle("theme:set", (_event, theme: ThemeMode) => {
    appStore.setTheme(theme);
    return theme;
  });

  ipcMain.handle("dialog:open-file", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Playlist",
          extensions: ["m3u", "m3u8", "txt"]
        }
      ]
    });

    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("source:import", (_event, input: ImportInput) => importSource(input));

  ipcMain.handle("source:refresh", (_event, sourceId: string) => refreshSource(sourceId));

  ipcMain.handle("source:remove", (_event, sourceId: string) => {
    appStore.removeSource(sourceId);
  });

  ipcMain.handle("xtream:episodes", (_event, payload: { sourceId: string; seriesId: string }) => {
    const snapshot = appStore.getSnapshot();
    const source = snapshot.sources.find((record) => record.id === payload.sourceId);
    if (!source || source.type !== "xtream") {
      throw new Error("Fonte Xtream inválida.");
    }
    const endpoint = source.meta?.endpoint;
    const username = appStore.getSecret(`${payload.sourceId}:username`);
    const password = appStore.getSecret(`${payload.sourceId}:password`);
    if (!endpoint || !username || !password) {
      throw new Error("Credenciais ou servidor Xtream em falta.");
    }
    return fetchXtreamSeriesEpisodes(endpoint, username, password, payload.seriesId);
  });

  ipcMain.handle("favorites:set", (_event, favorites: FavoriteRecord[]) => {
    appStore.setFavorites(favorites);
    return favorites;
  });

  ipcMain.handle("history:set", (_event, history: HistoryRecord[]) => {
    appStore.setHistory(history);
    return history;
  });

  ipcMain.handle("playback:set", (_event, playback: PlaybackState) => {
    appStore.setPlayback(playback);
    return playback;
  });

  ipcMain.handle("window:minimize", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.handle("window:toggle-maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      return false;
    }
    if (win.isMaximized()) {
      win.unmaximize();
      return false;
    }
    win.maximize();
    return true;
  });

  ipcMain.handle("window:close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });
}
