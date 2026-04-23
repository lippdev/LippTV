import crypto from "node:crypto";
import { parentPort, workerData } from "node:worker_threads";
import type { ContentItem, ImportResult, MediaLibrary, SourceRecord } from "@shared/types";

type WorkerPayload = {
  raw: string;
  sourceName: string;
  /** Base URL da lista (para resolver entradas relativas). */
  baseUrl?: string;
};

const ATTR_REGEX = /([a-zA-Z0-9-_.]+)="([^"]*)"/g;

function parseAttributes(headerLine: string) {
  const attributes: Record<string, string> = {};
  for (const match of headerLine.matchAll(ATTR_REGEX)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

function inferType(group: string) {
  const normalized = group.toLowerCase();
  const movieHints =
    /movie|vod|film|filme|cinema|pel[ií]cula|on\s*demand|uhd\s*4k\s*vod/i;
  const seriesHints =
    /series|s[eé]rie|show|temporada|season|episode|epis[oó]dio|box\s*set|complete\s*series/i;

  if (movieHints.test(normalized)) {
    return "movie" as const;
  }
  if (seriesHints.test(normalized)) {
    return "series" as const;
  }
  return "live" as const;
}

function resolveStreamUrl(rawUrl: string, baseUrl?: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return undefined;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^(rtmp|rts|rtsp|mmsh|rtp|udp|file):\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (!baseUrl) {
    return undefined;
  }
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return undefined;
  }
}

function nextStreamLine(lines: string[], startIndex: number) {
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const raw = lines[i];
    if (raw === undefined) {
      break;
    }
    const line = raw.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith("#")) {
      continue;
    }
    return { line, index: i };
  }
  return undefined;
}

function parseExtInfTitle(line: string) {
  const commaIdx = line.lastIndexOf(",");
  if (commaIdx === -1) {
    const attrs = parseAttributes(line);
    return attrs["tvg-name"]?.trim() || attrs["tvg-id"]?.trim() || "Sem nome";
  }
  return line.slice(commaIdx + 1).trim() || "Sem nome";
}

function parseM3u(raw: string, sourceName: string, baseUrl?: string): ImportResult {
  const sourceId = crypto.randomUUID();
  const lines = raw.split(/\r?\n/);
  const items: ContentItem[] = [];
  const groups = new Set<string>();

  let pendingGroup = "Sem categoria";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith("#EXTGRP:")) {
      pendingGroup = line.slice("#EXTGRP:".length).trim() || pendingGroup;
      continue;
    }

    if (line.startsWith("#EXTINF")) {
      const stream = nextStreamLine(lines, index);
      if (!stream) {
        continue;
      }

      const streamUrl = resolveStreamUrl(stream.line, baseUrl);
      if (!streamUrl) {
        continue;
      }

      const attributes = parseAttributes(line);
      const group =
        attributes["group-title"]?.trim() ||
        attributes["group"]?.trim() ||
        pendingGroup ||
        "Sem categoria";
      const type = inferType(group);
      const label =
        parseExtInfTitle(line) ||
        attributes["tvg-name"]?.trim() ||
        attributes["tvg-id"]?.trim() ||
        "Sem nome";

      groups.add(group);
      items.push({
        id: crypto.randomUUID(),
        name: label,
        logo: attributes["tvg-logo"],
        group,
        type,
        streamUrl,
        tvgId: attributes["tvg-id"],
        epgChannel: attributes["tvg-name"]
      });

      index = stream.index;
      continue;
    }
  }

  const stats = {
    live: items.filter((item) => item.type === "live").length,
    movies: items.filter((item) => item.type === "movie").length,
    series: items.filter((item) => item.type === "series").length,
    groups: groups.size
  };

  const source: SourceRecord = {
    id: sourceId,
    name: sourceName,
    type: "m3u",
    lastSyncAt: Date.now()
  };

  const library: MediaLibrary = {
    sourceId,
    sourceName,
    importedAt: Date.now(),
    stats,
    items,
    epg: []
  };

  return { source, library };
}

const payload = workerData as WorkerPayload;
const result = parseM3u(payload.raw, payload.sourceName, payload.baseUrl);
parentPort?.postMessage(result);
