import { create } from "zustand";
import type {
  AppSnapshot,
  ContentItem,
  FavoriteRecord,
  HistoryRecord,
  ImportInput,
  ImportResult,
  LibraryOverview,
  PlaybackState,
  ThemeMode
} from "@shared/types";

function computeOverview(snapshot: AppSnapshot): LibraryOverview {
  return snapshot.libraries.reduce<LibraryOverview>(
    (acc, library) => {
      acc.totalSources += 1;
      acc.totalItems += library.items.length;
      acc.liveChannels += library.stats.live;
      acc.movies += library.stats.movies;
      acc.series += library.stats.series;
      return acc;
    },
    {
      totalSources: 0,
      totalItems: 0,
      liveChannels: 0,
      movies: 0,
      series: 0
    }
  );
}

function buildEmptySnapshot(): AppSnapshot {
  return {
    theme: "dark",
    sources: [],
    libraries: [],
    favorites: [],
    history: [],
    playback: {
      volume: 1,
      muted: false
    }
  };
}

type AppState = {
  snapshot: AppSnapshot;
  selectedItem?: ContentItem;
  importing: boolean;
  error?: string;
  init: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  importSource: (input: ImportInput) => Promise<ImportResult>;
  refreshSource: (sourceId: string) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
  setSelectedItem: (item?: ContentItem) => void;
  toggleFavorite: (item: ContentItem, sourceId: string) => Promise<void>;
  pushHistory: (item: ContentItem, sourceId: string, positionMs?: number) => Promise<void>;
  setPlayback: (playback: PlaybackState) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  snapshot: buildEmptySnapshot(),
  importing: false,
  async init() {
    const snapshot = await window.lipptv.getSnapshot();
    set({ snapshot });
    document.documentElement.dataset.theme = snapshot.theme;
  },
  async setTheme(theme) {
    await window.lipptv.setTheme(theme);
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        theme
      }
    }));
    document.documentElement.dataset.theme = theme;
  },
  async importSource(input) {
    set({ importing: true, error: undefined });
    try {
      const result = await window.lipptv.importSource(input);
      set((state) => ({
        importing: false,
        snapshot: {
          ...state.snapshot,
          sources: [result.source, ...state.snapshot.sources.filter((source) => source.id !== result.source.id)],
          libraries: [
            result.library,
            ...state.snapshot.libraries.filter((library) => library.sourceId !== result.library.sourceId)
          ]
        }
      }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível importar a fonte.";
      set({ importing: false, error: message });
      throw error;
    }
  },
  async refreshSource(sourceId) {
    set({ error: undefined });
    try {
      await window.lipptv.refreshSource(sourceId);
      const snapshot = await window.lipptv.getSnapshot();
      set({ snapshot });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível atualizar.";
      set({ error: message });
      throw error;
    }
  },
  async removeSource(sourceId) {
    await window.lipptv.removeSource(sourceId);
    const snapshot = await window.lipptv.getSnapshot();
    const selected = get().selectedItem;
    const stillExists =
      selected &&
      snapshot.libraries.some((library) => library.items.some((row) => row.id === selected.id));
    set({
      snapshot,
      selectedItem: stillExists ? selected : undefined
    });
  },
  setSelectedItem(item) {
    set({ selectedItem: item });
  },
  async toggleFavorite(item, sourceId) {
    const current = get().snapshot.favorites;
    const exists = current.some((favorite) => favorite.itemId === item.id && favorite.sourceId === sourceId);
    const favorites: FavoriteRecord[] = exists
      ? current.filter((favorite) => !(favorite.itemId === item.id && favorite.sourceId === sourceId))
      : [...current, { itemId: item.id, sourceId, createdAt: Date.now() }];

    await window.lipptv.setFavorites(favorites);
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        favorites
      }
    }));
  },
  async pushHistory(item, sourceId, positionMs) {
    const filtered = get().snapshot.history.filter(
      (entry) => !(entry.itemId === item.id && entry.sourceId === sourceId)
    );
    const history: HistoryRecord[] = [
      { itemId: item.id, sourceId, watchedAt: Date.now(), positionMs },
      ...filtered
    ].slice(0, 100);
    await window.lipptv.setHistory(history);
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        history
      }
    }));
  },
  async setPlayback(playback) {
    await window.lipptv.setPlayback(playback);
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        playback
      }
    }));
  }
}));

export const selectOverview = (snapshot: AppSnapshot) => computeOverview(snapshot);
