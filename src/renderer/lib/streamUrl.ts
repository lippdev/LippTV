import type { ContentType } from "@shared/types";

// Containers not natively supported by Chromium/Electron
const UNSUPPORTED_CONTAINERS = /\.(mkv|avi|wmv|flv|mov|divx|xvid|rmvb|rm)$/i;

/**
 * Normalises a stream URL before handing it to the player.
 *
 * For VOD (movies/series) served via Xtream-compatible servers, the file
 * extension in the URL is often ignored server-side — the server re-encodes
 * or proxies the actual container. Stripping unsupported extensions forces
 * the server to deliver the stream without a container hint, which lets the
 * browser negotiate what it can actually decode.
 *
 * We do NOT touch live-TV URLs since those paths are intentional.
 */
export function normaliseStreamUrlForPlayback(
  url: string | undefined,
  type: ContentType | undefined
): string | undefined {
  if (!url) return undefined;

  // Only normalise VOD content
  if (type !== "movie" && type !== "series") return url;

  const pathWithoutQuery = url.split("?")[0] ?? "";

  // If the extension is one Chromium cannot decode, strip it so the
  // Xtream server can respond with a compatible stream instead.
  if (UNSUPPORTED_CONTAINERS.test(pathWithoutQuery)) {
    try {
      const parsed = new URL(url);
      parsed.pathname = parsed.pathname.replace(/\.[a-zA-Z0-9]{2,5}$/, "");
      return parsed.toString();
    } catch {
      // Malformed URL – return as-is and let the player deal with it
      return url;
    }
  }

  return url;
}
