import crypto from "node:crypto";
import type { ContentItem, ImportInput, ImportResult, MediaLibrary, SourceRecord } from "@shared/types";
import { iptvFetchJson } from "../../utils/iptvFetch";

function normalizeServerUrl(raw: string) {
  const trimmed = raw.trim();
  const u = new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`);
  const pathname = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
  return `${u.protocol}//${u.host}${pathname}`;
}

function buildPlayerApiUrl(
  server: string,
  username: string,
  password: string,
  action: string,
  extraParams?: Record<string, string>
) {
  const base = server.endsWith("/") ? server : `${server}/`;
  const url = new URL("player_api.php", base);
  url.searchParams.set("username", username);
  url.searchParams.set("password", password);
  url.searchParams.set("action", action);
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

async function fetchJson(url: string) {
  try {
    return await iptvFetchJson(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Xtream: ${message}`);
  }
}

function assertAuth(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Resposta Xtream inválida.");
  }
  const userInfo = (data as { user_info?: { auth?: number; status?: string } }).user_info;
  if (userInfo && Number(userInfo.auth) === 0) {
    throw new Error("Credenciais Xtream inválidas.");
  }
}

export async function importXtreamSource(input: ImportInput): Promise<ImportResult> {
  const baseUrl = input.url;
  const username = input.username;
  const password = input.password;

  if (!baseUrl || !username || !password) {
    throw new Error("A API Xtream requer URL, utilizador e palavra-passe.");
  }

  const server = normalizeServerUrl(baseUrl);

  const authUrl = buildPlayerApiUrl(server, username, password, "");
  const authData = await fetchJson(authUrl);
  assertAuth(authData);

  const [liveCategories, vodCategories, seriesCategories, liveStreams, vodStreams, seriesList] =
    await Promise.all([
      fetchJson(buildPlayerApiUrl(server, username, password, "get_live_categories")),
      fetchJson(buildPlayerApiUrl(server, username, password, "get_vod_categories")),
      fetchJson(buildPlayerApiUrl(server, username, password, "get_series_categories")),
      fetchJson(buildPlayerApiUrl(server, username, password, "get_live_streams")),
      fetchJson(buildPlayerApiUrl(server, username, password, "get_vod_streams")),
      fetchJson(buildPlayerApiUrl(server, username, password, "get_series"))
    ]);

  const liveCatMap = new Map<string, string>();
  for (const row of asArray(liveCategories as { category_id?: string; category_name?: string })) {
    if (row.category_id) {
      liveCatMap.set(String(row.category_id), String(row.category_name ?? "TV"));
    }
  }

  const vodCatMap = new Map<string, string>();
  for (const row of asArray(vodCategories as { category_id?: string; category_name?: string })) {
    if (row.category_id) {
      vodCatMap.set(String(row.category_id), String(row.category_name ?? "VOD"));
    }
  }

  const seriesCatMap = new Map<string, string>();
  for (const row of asArray(seriesCategories as { category_id?: string; category_name?: string })) {
    if (row.category_id) {
      seriesCatMap.set(String(row.category_id), String(row.category_name ?? "Séries"));
    }
  }

  const items: ContentItem[] = [];
  const sourceId = crypto.randomUUID();

  const encodeUser = encodeURIComponent(username);
  const encodePass = encodeURIComponent(password);

  for (const row of asArray(
    liveStreams as {
      stream_id?: number | string;
      name?: string;
      stream_icon?: string;
      category_id?: string | number;
      epg_channel_id?: string | null;
    }
  )) {
    const streamId = row.stream_id;
    if (streamId === undefined || streamId === null) {
      continue;
    }
    const catId = row.category_id !== undefined && row.category_id !== null ? String(row.category_id) : "";
    const group = liveCatMap.get(catId) ?? "TV ao vivo";
    // HLS (.m3u8) reproduz no Chromium + VHS; o .ts MPTS contínuo costuma falhar no elemento de vídeo.
    const streamUrl = `${server}/live/${encodeUser}/${encodePass}/${streamId}.m3u8`;
    items.push({
      id: crypto.randomUUID(),
      name: String(row.name ?? "Canal"),
      logo: row.stream_icon,
      group,
      type: "live",
      streamUrl,
      tvgId: row.epg_channel_id ? String(row.epg_channel_id) : undefined,
      epgChannel: row.epg_channel_id ? String(row.epg_channel_id) : undefined,
      meta: { xtreamStreamId: String(streamId) }
    });
  }

  for (const row of asArray(
    vodStreams as {
      stream_id?: number | string;
      name?: string;
      stream_icon?: string;
      category_id?: string | number;
      container_extension?: string;
    }
  )) {
    const streamId = row.stream_id;
    if (streamId === undefined || streamId === null) {
      continue;
    }
    const catId = row.category_id !== undefined && row.category_id !== null ? String(row.category_id) : "";
    const group = vodCatMap.get(catId) ?? "Filmes";
    const ext = (row.container_extension ?? "mp4").replace(/^\./, "");
    const streamUrl = `${server}/movie/${encodeUser}/${encodePass}/${streamId}.${ext}`;
    items.push({
      id: crypto.randomUUID(),
      name: String(row.name ?? "Filme"),
      logo: row.stream_icon,
      group,
      type: "movie",
      streamUrl,
      meta: { xtreamStreamId: String(streamId) }
    });
  }

  for (const row of asArray(
    seriesList as {
      series_id?: number | string;
      name?: string;
      cover?: string;
      category_id?: string | number;
    }
  )) {
    const seriesId = row.series_id;
    if (seriesId === undefined || seriesId === null) {
      continue;
    }
    const catId = row.category_id !== undefined && row.category_id !== null ? String(row.category_id) : "";
    const group = seriesCatMap.get(catId) ?? "Séries";
    items.push({
      id: crypto.randomUUID(),
      name: String(row.name ?? "Série"),
      logo: row.cover,
      group,
      type: "series",
      seriesId: String(seriesId),
      meta: { xtreamSeriesId: String(seriesId) }
    });
  }

  const groups = new Set(items.map((i) => i.group));

  const source: SourceRecord = {
    id: sourceId,
    name: input.name,
    type: "xtream",
    lastSyncAt: Date.now(),
    meta: {
      endpoint: server,
      epgUrl: input.epgUrl?.trim() ?? ""
    }
  };

  const library: MediaLibrary = {
    sourceId,
    sourceName: input.name,
    importedAt: Date.now(),
    stats: {
      live: items.filter((i) => i.type === "live").length,
      movies: items.filter((i) => i.type === "movie").length,
      series: items.filter((i) => i.type === "series").length,
      groups: groups.size
    },
    items,
    epg: []
  };

  return { source, library };
}

type EpisodeRow = {
  id?: string | number;
  title?: string;
  container_extension?: string;
  episode_num?: string | number;
  season?: string | number;
};

export async function fetchXtreamSeriesEpisodes(
  server: string,
  username: string,
  password: string,
  seriesId: string
): Promise<ContentItem[]> {
  const url = buildPlayerApiUrl(server, username, password, "get_series_info", {
    series_id: seriesId
  });
  const data = (await fetchJson(url)) as {
    episodes?: Record<string, EpisodeRow> | EpisodeRow[];
  };

  let episodeList: EpisodeRow[] = [];
  const raw = data.episodes;
  if (Array.isArray(raw)) {
    episodeList = raw;
  } else if (raw && typeof raw === "object") {
    episodeList = Object.values(raw);
  }

  const encodeUser = encodeURIComponent(username);
  const encodePass = encodeURIComponent(password);

  const items: ContentItem[] = [];
  for (const ep of episodeList) {
    const id = ep.id;
    if (id === undefined || id === null) {
      continue;
    }
    const ext = (ep.container_extension ?? "mp4").replace(/^\./, "");
    const streamUrl = `${server}/series/${encodeUser}/${encodePass}/${id}.${ext}`;
    const season = ep.season !== undefined ? `T${String(ep.season)} ` : "";
    const epNum = ep.episode_num !== undefined ? `E${String(ep.episode_num)} ` : "";
    const name = `${season}${epNum}${ep.title ?? "Episódio"}`.trim();
    items.push({
      id: crypto.randomUUID(),
      name,
      group: "Episódios",
      type: "series",
      streamUrl,
      seriesId,
      meta: { xtreamEpisodeId: String(id) }
    });
  }

  return items;
}
