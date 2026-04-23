import crypto from "node:crypto";
import type { ImportInput, ImportResult, MediaLibrary, SourceRecord } from "@shared/types";
import { iptvFetchText } from "../../utils/iptvFetch";

export async function importStalkerSource(input: ImportInput): Promise<ImportResult> {
  if (!input.portalUrl || !input.macAddress) {
    throw new Error("Portal Stalker requires portalUrl and macAddress.");
  }

  const profileUrl = new URL("/stalker_portal/server/load.php", input.portalUrl);
  profileUrl.searchParams.set("type", "stb");
  profileUrl.searchParams.set("action", "get_profile");
  profileUrl.searchParams.set("JsHttpRequest", "1-xml");

  await iptvFetchText(profileUrl.toString(), {
    headers: {
      cookie: `mac=${input.macAddress}; stb_lang=en; timezone=America/Sao_Paulo`,
      "user-agent": "Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3"
    }
  });

  const sourceId = crypto.randomUUID();
  const source: SourceRecord = {
    id: sourceId,
    name: input.name,
    type: "stalker",
    lastSyncAt: Date.now(),
    meta: {
      portalUrl: input.portalUrl
    }
  };

  const library: MediaLibrary = {
    sourceId,
    sourceName: input.name,
    importedAt: Date.now(),
    stats: {
      live: 0,
      movies: 0,
      series: 0,
      groups: 0
    },
    items: [],
    epg: []
  };

  return { source, library };
}
