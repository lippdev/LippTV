import fs from "node:fs/promises";
import path from "node:path";
import { Worker } from "node:worker_threads";
import type { ImportInput, ImportResult } from "@shared/types";
import { iptvFetchText } from "../../utils/iptvFetch";

function runWorker(payload: { raw: string; sourceName: string; baseUrl?: string }) {
  return new Promise<ImportResult>((resolve, reject) => {
    const workerPath = path.join(__dirname, "..", "..", "workers", "m3uWorker.js");
    const worker = new Worker(workerPath, {
      workerData: payload
    });

    worker.once("message", (message: ImportResult) => resolve(message));
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`M3U worker stopped with exit code ${code}`));
      }
    });
  });
}

export async function importM3uSource(input: ImportInput) {
  const raw = input.filePath
    ? await fs.readFile(input.filePath, "utf8")
    : await iptvFetchText(input.url!).then(({ status, body }) => {
        if (status < 200 || status >= 300) {
          throw new Error(`Não foi possível obter a lista: HTTP ${status}`);
        }
        return body;
      });

  let baseUrl: string | undefined;
  if (input.url) {
    try {
      baseUrl = new URL(input.url).href;
    } catch {
      baseUrl = undefined;
    }
  }

  return runWorker({
    raw,
    sourceName: input.name,
    baseUrl
  });
}
