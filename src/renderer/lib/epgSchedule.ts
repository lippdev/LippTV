import type { ContentItem, EpgEntry } from "@shared/types";

function channelMatches(entry: EpgEntry, item: ContentItem) {
  const candidates = [item.tvgId, item.epgChannel].filter(Boolean) as string[];
  if (!candidates.length) {
    return false;
  }
  return candidates.some((id) => id === entry.channelId);
}

export function getEpgNowNext(epg: EpgEntry[], item: ContentItem | undefined, now = Date.now()) {
  if (!item || !epg.length) {
    return { current: undefined as string | undefined, next: undefined as string | undefined };
  }

  const mine = epg.filter((row) => channelMatches(row, item)).sort((a, b) => a.start - b.start);
  const current = mine.find((row) => row.start <= now && now < row.end);
  const next = mine.find((row) => row.start > now);
  return {
    current: current?.title,
    next: next?.title
  };
}

export type EpgBlock = {
  title: string;
  start: number;
  end: number;
  description?: string;
};

export function getEpgNowNextBlocks(
  epg: EpgEntry[],
  item: ContentItem | undefined,
  now = Date.now()
): { current?: EpgBlock; next?: EpgBlock } {
  if (!item || !epg.length) {
    return {};
  }

  const mine = epg.filter((row) => channelMatches(row, item)).sort((a, b) => a.start - b.start);
  const current = mine.find((row) => row.start <= now && now < row.end);
  const next = mine.find((row) => row.start > now);

  return {
    current: current
      ? {
          title: current.title,
          start: current.start,
          end: current.end,
          description: current.description
        }
      : undefined,
    next: next
      ? {
          title: next.title,
          start: next.start,
          end: next.end,
          description: next.description
        }
      : undefined
  };
}

export function formatEpgTimeRange(startMs: number, endMs: number) {
  const fmt = (t: number) =>
    new Date(t).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit"
    });
  return `${fmt(startMs)} – ${fmt(endMs)}`;
}

export function progressInProgram(now: number, start: number, end: number) {
  if (end <= start) {
    return 0;
  }
  const p = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(p)));
}
