import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const DEFAULT_UA = "LippTV/0.1.0";
const DEFAULT_TIMEOUT_MS = 120_000;

function describeNetworkError(url: string, err: unknown): Error {
  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  })();

  let detail = "";
  if (err instanceof Error) {
    detail = err.message;
    const cause = (err as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
      detail = `${detail} (${cause.message})`;
    } else if (cause && typeof cause === "object" && "code" in cause) {
      detail = `${detail} (${String((cause as { code?: string }).code)})`;
    }
  }

  const msg = detail
    ? `Não foi possível ligar a ${host}: ${detail}. Se o painel usar HTTPS com certificado inválido, a app já tenta contornar; confirme URL, porta e firewall.`
    : `Não foi possível ligar a ${host}. Verifique URL, porta, rede e firewall.`;

  return new Error(msg);
}

export type IptvFetchResult = {
  status: number;
  body: string;
};

/**
 * HTTP(S) para fontes IPTV no main process.
 * `rejectUnauthorized: false` em HTTPS — muitos painéis Xtream usam certificados autoassinados;
 * o utilizador fornece o servidor explicitamente.
 */
export function iptvFetchText(
  urlString: string,
  init?: { headers?: Record<string, string>; method?: string }
): Promise<IptvFetchResult> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return Promise.reject(new Error(`URL inválida: ${urlString}`));
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return Promise.reject(new Error(`Protocolo não suportado: ${url.protocol}`));
  }

  const isHttps = url.protocol === "https:";
  const path = (url.pathname || "/") + url.search;
  const port = url.port ? Number(url.port) : isHttps ? 443 : 80;

  return new Promise((resolve, reject) => {
    const reqOptions: https.RequestOptions = {
      hostname: url.hostname,
      port,
      path,
      method: init?.method ?? "GET",
      headers: {
        "user-agent": DEFAULT_UA,
        ...init?.headers
      }
    };

    if (isHttps) {
      reqOptions.rejectUnauthorized = false;
    }

    const lib = isHttps ? https : http;
    const req = lib.request(reqOptions, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          body: Buffer.concat(chunks).toString("utf8")
        });
      });
    });

    req.on("error", (err) => reject(describeNetworkError(urlString, err)));
    req.setTimeout(DEFAULT_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Tempo limite (${DEFAULT_TIMEOUT_MS / 1000}s) ao contactar ${url.host}.`));
    });
    req.end();
  });
}

export async function iptvFetchJson(url: string): Promise<unknown> {
  const { status, body } = await iptvFetchText(url, {
    headers: {
      accept: "application/json,text/json,*/*"
    }
  });

  if (status < 200 || status >= 300) {
    throw new Error(`Pedido HTTP ${status}`);
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error("Resposta não é JSON válido (verifique URL e credenciais).");
  }
}
