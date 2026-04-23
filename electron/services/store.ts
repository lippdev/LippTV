import Store from "electron-store";
import { safeStorage } from "electron";
import type {
  AppSnapshot,
  EpgEntry,
  FavoriteRecord,
  HistoryRecord,
  MediaLibrary,
  PlaybackState,
  SourceRecord,
  ThemeMode
} from "@shared/types";

type SecretRecord = Record<string, string>;

const metadataStore = new Store<AppSnapshot>({
  name: "app-state",
  defaults: {
    theme: "dark",
    sources: [],
    libraries: [],
    favorites: [],
    history: [],
    playback: {
      volume: 1,
      muted: false
    }
  }
});

const secretStore = new Store<{ secrets: SecretRecord }>({
  name: "secure-state",
  defaults: {
    secrets: {}
  }
});

function encodeSecret(value: string) {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(value).toString("base64");
  }

  return Buffer.from(value, "utf8").toString("base64");
}

function decodeSecret(value: string) {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.decryptString(Buffer.from(value, "base64"));
  }

  return Buffer.from(value, "base64").toString("utf8");
}

export const appStore = {
  getSnapshot() {
    return metadataStore.store;
  },
  setTheme(theme: ThemeMode) {
    metadataStore.set("theme", theme);
  },
  saveSource(source: SourceRecord, library: MediaLibrary) {
    const currentSources = metadataStore.get("sources");
    const currentLibraries = metadataStore.get("libraries");

    metadataStore.set(
      "sources",
      [...currentSources.filter((item) => item.id !== source.id), source].sort((a, b) =>
        b.lastSyncAt - a.lastSyncAt
      )
    );

    metadataStore.set(
      "libraries",
      [...currentLibraries.filter((item) => item.sourceId !== library.sourceId), library].sort(
        (a, b) => b.importedAt - a.importedAt
      )
    );
  },
  setFavorites(favorites: FavoriteRecord[]) {
    metadataStore.set("favorites", favorites);
  },
  setHistory(history: HistoryRecord[]) {
    metadataStore.set("history", history);
  },
  setPlayback(playback: PlaybackState) {
    metadataStore.set("playback", playback);
  },
  setSecret(key: string, value: string) {
    const current = secretStore.get("secrets");
    secretStore.set("secrets", {
      ...current,
      [key]: encodeSecret(value)
    });
  },
  getSecret(key: string) {
    const current = secretStore.get("secrets")[key];
    return current ? decodeSecret(current) : undefined;
  },
  mergeLibraryEpg(sourceId: string, epg: EpgEntry[]) {
    const libraries = metadataStore.get("libraries");
    const index = libraries.findIndex((library) => library.sourceId === sourceId);
    if (index === -1) {
      return;
    }
    const next = [...libraries];
    next[index] = { ...next[index], epg };
    metadataStore.set("libraries", next);
  },
  removeSource(sourceId: string) {
    const sources = metadataStore.get("sources").filter((source) => source.id !== sourceId);
    const libraries = metadataStore.get("libraries").filter((library) => library.sourceId !== sourceId);
    const favorites = metadataStore.get("favorites").filter((favorite) => favorite.sourceId !== sourceId);
    const history = metadataStore.get("history").filter((entry) => entry.sourceId !== sourceId);
    metadataStore.set("sources", sources);
    metadataStore.set("libraries", libraries);
    metadataStore.set("favorites", favorites);
    metadataStore.set("history", history);

    const secrets = { ...secretStore.get("secrets") };
    for (const key of Object.keys(secrets)) {
      if (key.startsWith(`${sourceId}:`)) {
        delete secrets[key];
      }
    }
    secretStore.set("secrets", secrets);
  }
};
