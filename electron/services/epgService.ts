import { XMLParser } from "fast-xml-parser";
import type { EpgEntry } from "@shared/types";
import { iptvFetchText } from "../utils/iptvFetch";
import { logger } from "../utils/logger";

function parseXmltvTimestamp(raw: string): number {
  const cleaned = raw.trim().split(/\s+/)[0] ?? "";
  if (cleaned.length < 14) {
    return NaN;
  }
  const Y = Number(cleaned.slice(0, 4));
  const M = Number(cleaned.slice(4, 6)) - 1;
  const D = Number(cleaned.slice(6, 8));
  const h = Number(cleaned.slice(8, 10));
  const m = Number(cleaned.slice(10, 12));
  const s = Number(cleaned.slice(12, 14));
  return Date.UTC(Y, M, D, h, m, s);
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export async function fetchEpgEntries(url: string): Promise<EpgEntry[]> {
  const { status, body: text } = await iptvFetchText(url, {
    headers: {
      accept: "application/xml,text/xml,*/*"
    }
  });

  if (status < 200 || status >= 300) {
    throw new Error(`EPG HTTP ${status}`);
  }
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });

  const doc = parser.parse(text) as {
    tv?: {
      programme?: Record<string, unknown> | Record<string, unknown>[];
    };
  };

  const programmes = asArray(doc.tv?.programme as Record<string, unknown> | Record<string, unknown>[] | undefined);

  const entries: EpgEntry[] = [];

  for (const node of programmes) {
    const channelId = String(node["@_channel"] ?? node["@_id"] ?? "");
    const startRaw = String(node["@_start"] ?? "");
    const stopRaw = String(node["@_stop"] ?? "");
    const start = parseXmltvTimestamp(startRaw);
    const end = parseXmltvTimestamp(stopRaw);
    if (!channelId || !Number.isFinite(start) || !Number.isFinite(end)) {
      continue;
    }

    const titleNode = node.title;
    let title = "Programa";
    if (typeof titleNode === "string") {
      title = titleNode;
    } else if (titleNode && typeof titleNode === "object" && "#text" in titleNode) {
      title = String((titleNode as { "#text": string })["#text"]);
    } else if (Array.isArray(titleNode) && titleNode[0]) {
      const first = titleNode[0] as { "#text"?: string };
      title = first["#text"] ?? title;
    }

    const descNode = node.desc;
    let description: string | undefined;
    if (typeof descNode === "string") {
      description = descNode;
    } else if (descNode && typeof descNode === "object" && "#text" in descNode) {
      description = String((descNode as { "#text": string })["#text"]);
    }

    entries.push({
      id: `${channelId}-${start}-${end}`,
      channelId,
      title,
      start,
      end,
      description
    });
  }

  logger.info(`EPG parsed: ${entries.length} entries`);
  return entries;
}
