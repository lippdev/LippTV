import type { ContentType } from "@shared/types";

export function normaliseStreamUrlForPlayback(
  url: string | undefined,
  _type: ContentType | undefined
): string | undefined {
  return url;
}
