/** Buffer circular para copiar a partir da consola: __LIPPTV_DEBUG.getRecent() */

const MAX = 120;
const buffer: { t: string; level: "info" | "warn" | "error"; scope: string; message: string; data?: unknown }[] = [];

function push(
  level: "info" | "warn" | "error",
  scope: string,
  message: string,
  data?: unknown
) {
  const entry = { t: new Date().toISOString(), level, scope, message, data };
  buffer.push(entry);
  if (buffer.length > MAX) {
    buffer.shift();
  }
  const line = `[LippTV] ${entry.t} [${level}] ${scope} ${message}`;
  if (data !== undefined) {
    (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line, data);
  } else {
    (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
  }
}

export function debugLogInfo(scope: string, message: string, data?: unknown) {
  push("info", scope, message, data);
}

export function debugLogWarn(scope: string, message: string, data?: unknown) {
  push("warn", scope, message, data);
}

export function debugLogError(scope: string, message: string, data?: unknown) {
  push("error", scope, message, data);
}

export function getDebugLogText(): string {
  return buffer.map((e) => JSON.stringify(e)).join("\n");
}

{
  const w = window as unknown as { __LIPPTV_DEBUG?: { getRecent: () => string; clear: () => void } };
  w.__LIPPTV_DEBUG = {
    getRecent: getDebugLogText,
    clear: () => {
      buffer.length = 0;
    }
  };
}
