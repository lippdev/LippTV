import { contextBridge, ipcRenderer } from "electron";
import type {
  AppSnapshot,
  ContentItem,
  FavoriteRecord,
  HistoryRecord,
  ImportInput,
  ImportResult,
  PlaybackState,
  ThemeMode
} from "@shared/types";

const api = {
  getSnapshot: () => ipcRenderer.invoke("app:snapshot") as Promise<AppSnapshot>,
  setTheme: (theme: ThemeMode) => ipcRenderer.invoke("theme:set", theme) as Promise<ThemeMode>,
  openPlaylistDialog: () => ipcRenderer.invoke("dialog:open-file") as Promise<string | null>,
  importSource: (input: ImportInput) => ipcRenderer.invoke("source:import", input) as Promise<ImportResult>,
  refreshSource: (sourceId: string) => ipcRenderer.invoke("source:refresh", sourceId) as Promise<ImportResult>,
  removeSource: (sourceId: string) => ipcRenderer.invoke("source:remove", sourceId) as Promise<void>,
  listXtreamEpisodes: (payload: { sourceId: string; seriesId: string }) =>
    ipcRenderer.invoke("xtream:episodes", payload) as Promise<ContentItem[]>,
  setFavorites: (favorites: FavoriteRecord[]) =>
    ipcRenderer.invoke("favorites:set", favorites) as Promise<FavoriteRecord[]>,
  setHistory: (history: HistoryRecord[]) =>
    ipcRenderer.invoke("history:set", history) as Promise<HistoryRecord[]>,
  setPlayback: (playback: PlaybackState) =>
    ipcRenderer.invoke("playback:set", playback) as Promise<PlaybackState>,
  minimizeWindow: () => ipcRenderer.invoke("window:minimize") as Promise<void>,
  toggleMaximizeWindow: () => ipcRenderer.invoke("window:toggle-maximize") as Promise<boolean>,
  closeWindow: () => ipcRenderer.invoke("window:close") as Promise<void>,
  onMaximizedChange: (listener: (isMaximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => listener(isMaximized);
    ipcRenderer.on("window:maximized-changed", handler);
    return () => {
      ipcRenderer.removeListener("window:maximized-changed", handler);
    };
  }
};

contextBridge.exposeInMainWorld("lipptv", api);

export type DesktopApi = typeof api;
