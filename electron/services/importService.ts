import type { ImportInput, ImportResult } from "@shared/types";
import { importM3uSource } from "./connectors/m3u";
import { importStalkerSource } from "./connectors/stalker";
import { importXtreamSource } from "./connectors/xtream";
import { fetchEpgEntries } from "./epgService";
import { appStore } from "./store";
import { logger } from "../utils/logger";

export type ImportSourceOptions = {
  /** Reutilizar ID (atualização de lista existente). */
  existingSourceId?: string;
};

function assertInput(input: ImportInput) {
  if (!input.name.trim()) {
    throw new Error("O nome da fonte é obrigatório.");
  }

  if (input.url) {
    new URL(input.url);
  }

  if (input.portalUrl) {
    new URL(input.portalUrl);
  }

  if (input.type === "m3u" && !input.url?.trim() && !input.filePath) {
    throw new Error("Indique a URL da lista ou escolha um ficheiro M3U.");
  }
}

function mergePersistedImportMeta(input: ImportInput, result: ImportResult) {
  const base: Record<string, string> = { ...(result.source.meta ?? {}) };
  if (input.type === "m3u") {
    if (input.url?.trim()) {
      base.m3uUrl = input.url.trim();
    }
    if (input.filePath) {
      base.m3uFilePath = input.filePath;
    }
    if (input.epgUrl?.trim()) {
      base.epgUrl = input.epgUrl.trim();
    }
  }
  if (input.type === "xtream" && input.epgUrl?.trim()) {
    base.epgUrl = input.epgUrl.trim();
  }
  result.source.meta = base;
}

async function attachEpgIfAny(sourceId: string, epgUrl?: string) {
  if (!epgUrl?.trim()) {
    return;
  }
  try {
    const entries = await fetchEpgEntries(epgUrl.trim());
    appStore.mergeLibraryEpg(sourceId, entries);
  } catch (error) {
    logger.warn("Falha ao importar EPG", error);
  }
}

export async function importSource(
  input: ImportInput,
  options?: ImportSourceOptions
): Promise<ImportResult> {
  assertInput(input);

  let result: ImportResult;

  switch (input.type) {
    case "m3u":
      result = await importM3uSource(input);
      break;
    case "xtream":
      result = await importXtreamSource(input);
      break;
    case "stalker":
      result = await importStalkerSource(input);
      break;
    default:
      throw new Error(`Tipo de fonte não suportado: ${(input as ImportInput).type}`);
  }

  const sourceId = options?.existingSourceId ?? result.source.id;
  result.source.id = sourceId;
  result.library.sourceId = sourceId;
  result.source.lastSyncAt = Date.now();
  result.library.importedAt = Date.now();

  mergePersistedImportMeta(input, result);

  if (input.type === "xtream") {
    if (input.username) {
      appStore.setSecret(`${sourceId}:username`, input.username);
    }
    if (input.password) {
      appStore.setSecret(`${sourceId}:password`, input.password);
    }
  }

  if (input.type === "stalker" && input.macAddress) {
    appStore.setSecret(`${sourceId}:mac`, input.macAddress);
  }

  appStore.saveSource(result.source, result.library);

  const epgUrl = input.epgUrl?.trim() || result.source.meta?.epgUrl;
  await attachEpgIfAny(sourceId, epgUrl);

  return result;
}

export async function refreshSource(sourceId: string): Promise<ImportResult> {
  const snapshot = appStore.getSnapshot();
  const source = snapshot.sources.find((item) => item.id === sourceId);
  if (!source) {
    throw new Error("Fonte não encontrada.");
  }

  if (source.type === "m3u") {
    const input: ImportInput = {
      type: "m3u",
      name: source.name,
      url: source.meta?.m3uUrl?.trim() || undefined,
      filePath: source.meta?.m3uFilePath || undefined,
      epgUrl: source.meta?.epgUrl
    };
    if (!input.url && !input.filePath) {
      throw new Error("Não há URL nem ficheiro guardado para atualizar esta lista.");
    }
    return importSource(input, { existingSourceId: sourceId });
  }

  if (source.type === "xtream") {
    const endpoint = source.meta?.endpoint;
    const username = appStore.getSecret(`${sourceId}:username`);
    const password = appStore.getSecret(`${sourceId}:password`);
    if (!endpoint || !username || !password) {
      throw new Error("Configuração Xtream incompleta para atualizar.");
    }
    return importSource(
      {
        type: "xtream",
        name: source.name,
        url: endpoint,
        username,
        password,
        epgUrl: source.meta?.epgUrl
      },
      { existingSourceId: sourceId }
    );
  }

  throw new Error("Atualização automática ainda não está disponível para este tipo de fonte.");
}
