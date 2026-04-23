import { session } from "electron";

/**
 * Reprodução IPTV: painéis Xtream usam HTTPS com certificados fracos; o `<video>` e o hls.js
 * fazem pedidos no renderer/Chromium, que por defeito rejeita essas ligações.
 * Também reforçamos User-Agent / Referer nos pedidos típicos de stream.
 */
export function configurePlaybackSession() {
  session.defaultSession.setCertificateVerifyProc((_request, callback) => {
    callback(0);
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { url, resourceType, requestHeaders } = details;

    // Inclui /auth/… (tokens em URLs absolutas no m3u8, ex. edge em IP diferente do manifest)
    const streamLike =
      /\/(live|movie|series)\/[^/]+\/[^/]+\//.test(url) ||
      /\.(m3u8|ts)(\?|$|#)/i.test(url) ||
      /\/auth\//i.test(url);

    // Video.js/VHS usa XHR/fetch; em algumas versões do Chromium o tipo não é "xhr".
    // Evitamos alterar o documento principal (mainFrame/subFrame).
    if (streamLike && resourceType !== "mainFrame" && resourceType !== "subFrame") {
      const existing = requestHeaders.Referer;
      let referer =
        typeof existing === "string"
          ? existing
          : Array.isArray(existing)
            ? existing[0]
            : undefined;
      if (!referer) {
        try {
          const parsed = new URL(url);
          referer = `${parsed.origin}/`;
        } catch {
          referer = "*";
        }
      }

      callback({
        requestHeaders: {
          ...requestHeaders,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Referer: referer
        }
      });
      return;
    }

    callback({ requestHeaders });
  });
}
