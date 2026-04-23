export type ThemeMode = "dark" | "light";

export type ContentType = "live" | "movie" | "series";

export type SourceKind = "m3u" | "xtream" | "stalker";

export interface ImportInput {
  type: SourceKind;
  name: string;
  url?: string;
  filePath?: string;
  username?: string;
  password?: string;
  portalUrl?: string;
  macAddress?: string;
  /** Optional XMLTV / EPG URL (applied to this source after import). */
  epgUrl?: string;
}

export interface ContentItem {
  id: string;
  name: string;
  logo?: string;
  group: string;
  type: ContentType;
  /** Xtream / UI: empty for series catalogue rows until an episode is chosen. */
  streamUrl?: string;
  tvgId?: string;
  epgChannel?: string;
  description?: string;
  /** Xtream series_id when type is series and episodes are loaded on demand. */
  seriesId?: string;
  meta?: Record<string, string>;
}

export interface EpgEntry {
  id: string;
  channelId: string;
  title: string;
  start: number;
  end: number;
  description?: string;
}

export interface MediaLibrary {
  sourceId: string;
  sourceName: string;
  importedAt: number;
  stats: {
    live: number;
    movies: number;
    series: number;
    groups: number;
  };
  items: ContentItem[];
  epg: EpgEntry[];
}

export interface SourceRecord {
  id: string;
  name: string;
  type: SourceKind;
  lastSyncAt: number;
  meta?: Record<string, string>;
}

export interface PlaybackState {
  itemId?: string;
  sourceId?: string;
  positionMs?: number;
  volume: number;
  muted: boolean;
}

export interface FavoriteRecord {
  itemId: string;
  sourceId: string;
  createdAt: number;
}

export interface HistoryRecord {
  itemId: string;
  sourceId: string;
  watchedAt: number;
  positionMs?: number;
}

export interface AppSnapshot {
  theme: ThemeMode;
  sources: SourceRecord[];
  libraries: MediaLibrary[];
  favorites: FavoriteRecord[];
  history: HistoryRecord[];
  playback: PlaybackState;
}

export interface LibraryOverview {
  totalSources: number;
  totalItems: number;
  liveChannels: number;
  movies: number;
  series: number;
}

export interface ImportResult {
  source: SourceRecord;
  library: MediaLibrary;
}
