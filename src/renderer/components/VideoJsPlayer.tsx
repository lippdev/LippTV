import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import mpegts from "mpegts.js";
import { debugLogError, debugLogInfo, debugLogWarn } from "../lib/debugLog";

const U8 = (s: string) => (s.length > 200 ? `${s.slice(0, 200)}...` : s);

export type PlayerHandle = {
  currentTime: () => number;
  isDisposed: () => boolean;
  pause: () => void;
  play: () => Promise<void> | undefined;
};

export type VideoJsPlayerProps = {
  sourceUrl: string;
  volume: number;
  muted: boolean;
  isLive?: boolean;
  className?: string;
  onReady?: (player: PlayerHandle) => void;
  onDispose?: () => void;
  onPlaying?: () => void;
  onPause?: () => void;
  onWaiting?: () => void;
  onError?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
  onLoadedData?: () => void;
};

function isHlsSource(url: string) {
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  return clean.endsWith(".m3u8") || url.toLowerCase().includes("m3u8");
}

function isMpegTsSource(url: string) {
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  return clean.endsWith(".ts") || /\/live\/[^/]+\/[^/]+\/[^/?#]+($|[?#])/i.test(url);
}

function swapExtension(url: string, from: RegExp, to: string) {
  try {
    const parsed = new URL(url);
    if (!from.test(parsed.pathname)) {
      return undefined;
    }
    parsed.pathname = parsed.pathname.replace(from, to);
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function buildPlaybackCandidates(url: string) {
  const candidates = [url];
  const ts = swapExtension(url, /\.m3u8$/i, ".ts");
  const hls = swapExtension(url, /\.ts$/i, ".m3u8");

  for (const candidate of [ts, hls]) {
    if (candidate && !candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  }

  return candidates;
}

function formatMediaError(error: MediaError | null) {
  if (!error) {
    return "Erro desconhecido de reproducao.";
  }

  const byCode: Record<number, string> = {
    1: "Reproducao abortada.",
    2: "Falha de rede ao carregar a midia.",
    3: "Falha ao decodificar audio ou video.",
    4: "Formato ou codec nao suportado pelo Electron."
  };

  return error.message || byCode[error.code] || `Erro de midia ${error.code}.`;
}

export function VideoJsPlayer({
  sourceUrl,
  volume,
  muted,
  isLive = true,
  className,
  onReady,
  onDispose,
  onPlaying,
  onPause,
  onWaiting,
  onError,
  onEnded,
  onTimeUpdate,
  onLoadedData
}: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const disposedRef = useRef(false);
  const handlersRef = useRef({
    onReady,
    onDispose,
    onPlaying,
    onPause,
    onWaiting,
    onError,
    onEnded,
    onTimeUpdate,
    onLoadedData
  });
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playbackCandidates = useMemo(() => buildPlaybackCandidates(sourceUrl), [sourceUrl]);
  const activeUrl = playbackCandidates[Math.min(activeIndex, playbackCandidates.length - 1)] ?? sourceUrl;

  handlersRef.current = {
    onReady,
    onDispose,
    onPlaying,
    onPause,
    onWaiting,
    onError,
    onEnded,
    onTimeUpdate,
    onLoadedData
  };

  useEffect(() => {
    setActiveIndex(0);
    setDiagnostic(null);
  }, [sourceUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    disposedRef.current = false;
    setDiagnostic(null);
    video.volume = volume;
    video.muted = muted;

    let hls: Hls | undefined;
    let tsPlayer: mpegts.Player | undefined;
    let codecWatchTimer: number | undefined;
    let stallTimer: number | undefined;
    let stallCount = 0;
    let hlsRecoveries = 0;
    let hlsNetworkRetries = 0;
    const hlsMode = isHlsSource(activeUrl);
    const mpegTsMode = !hlsMode && isMpegTsSource(activeUrl);

    const fallbackToNextCandidate = (reason: string) => {
      if (activeIndex + 1 < playbackCandidates.length) {
        const nextUrl = playbackCandidates[activeIndex + 1];
        debugLogWarn("WebPlayer", "alternando variante do stream", {
          reason,
          from: U8(activeUrl),
          to: U8(nextUrl)
        });
        setDiagnostic("Ajustando formato do stream...");
        setActiveIndex((index) => index + 1);
        return true;
      }
      return false;
    };

    const handle: PlayerHandle = {
      currentTime: () => video.currentTime || 0,
      isDisposed: () => disposedRef.current,
      pause: () => video.pause(),
      play: () => video.play()
    };

    const tryPlay = () => {
      const playAttempt = video.play();
      if (playAttempt) {
        void playAttempt.catch((error: unknown) => {
          debugLogWarn("WebPlayer", "autoplay falhou", {
            error: error instanceof Error ? error.message : String(error),
            src: U8(activeUrl)
          });
        });
      }
    };

    const watchForAudioOnlyDecode = () => {
      window.clearTimeout(codecWatchTimer);
      codecWatchTimer = window.setTimeout(() => {
        if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth === 0) {
          const message =
            "O audio carregou, mas o Electron nao conseguiu decodificar a faixa de video. A fonte pode estar em HEVC/H.265, MPEG-TS direto ou outro codec sem suporte nativo.";
          setDiagnostic(message);
          debugLogWarn("WebPlayer", "audio sem imagem detectado", {
            readyState: String(video.readyState),
            videoWidth: String(video.videoWidth),
            videoHeight: String(video.videoHeight),
            currentSrc: U8(video.currentSrc || activeUrl)
          });
        }
      }, 1800);
    };

    const watchForStallLoop = () => {
      window.clearTimeout(stallTimer);
      stallTimer = window.setTimeout(() => {
        if (!video.paused && video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
          stallCount += 1;
          debugLogWarn("WebPlayer", "stall detectado", {
            count: String(stallCount),
            readyState: String(video.readyState),
            currentTime: String(video.currentTime),
            src: U8(activeUrl)
          });
          if (stallCount >= 3 && fallbackToNextCandidate("stall-loop")) {
            return;
          }
        }
      }, 2200);
    };

    const onLoadedMetadata = () => {
      debugLogInfo("WebPlayer", "metadata de video", {
        mode: hlsMode ? "hls.js" : "native",
        isLive: String(isLive),
        videoWidth: String(video.videoWidth),
        videoHeight: String(video.videoHeight),
        clientWidth: String(video.clientWidth),
        clientHeight: String(video.clientHeight),
        src: U8(activeUrl)
      });
      watchForAudioOnlyDecode();
    };

    const onLoadedDataEvent = () => {
      handlersRef.current.onLoadedData?.();
      watchForAudioOnlyDecode();
    };

    const onPlayingEvent = () => {
      setPaused(false);
      setBuffering(false);
      handlersRef.current.onPlaying?.();
      stallCount = 0;
      watchForAudioOnlyDecode();
    };

    const onPauseEvent = () => {
      setPaused(true);
      handlersRef.current.onPause?.();
    };
    const onWaitingEvent = () => {
      setBuffering(true);
      handlersRef.current.onWaiting?.();
      watchForStallLoop();
    };
    const onEndedEvent = () => {
      setPaused(true);
      handlersRef.current.onEnded?.();
    };
    const onTimeUpdateEvent = () => {
      stallCount = 0;
      setCurrentTime(video.currentTime || 0);
      handlersRef.current.onTimeUpdate?.(video.currentTime || 0);
    };
    const onDurationChangeEvent = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onErrorEvent = () => {
      const message = formatMediaError(video.error);
      if (!fallbackToNextCandidate(message)) {
        setDiagnostic(message);
      }
      debugLogError("WebPlayer", "erro de midia", {
        message,
        code: String(video.error?.code ?? ""),
        src: U8(activeUrl)
      });
      handlersRef.current.onError?.();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onLoadedDataEvent);
    video.addEventListener("playing", onPlayingEvent);
    video.addEventListener("pause", onPauseEvent);
    video.addEventListener("waiting", onWaitingEvent);
    video.addEventListener("ended", onEndedEvent);
    video.addEventListener("timeupdate", onTimeUpdateEvent);
    video.addEventListener("durationchange", onDurationChangeEvent);
    video.addEventListener("error", onErrorEvent);

    debugLogInfo("WebPlayer", "a iniciar", {
      mode: mpegTsMode && mpegts.isSupported() ? "mpegts.js" : hlsMode && Hls.isSupported() ? "hls.js" : "native",
      hlsSupported: String(Hls.isSupported()),
      mpegtsSupported: String(mpegts.isSupported()),
      nativeHls: String(video.canPlayType("application/vnd.apple.mpegurl")),
      candidate: `${activeIndex + 1}/${playbackCandidates.length}`,
      src: U8(activeUrl)
    });

    handlersRef.current.onReady?.(handle);

    if (mpegTsMode && mpegts.isSupported()) {
      tsPlayer = mpegts.createPlayer(
        {
          type: "mpegts",
          isLive,
          url: activeUrl
        },
        {
          enableWorker: true,
          enableStashBuffer: true,
          stashInitialSize: 1024 * 1024,
          isLive,
          liveBufferLatencyChasing: false,
          liveSync: false,
          lazyLoad: false,
          autoCleanupSourceBuffer: true
        }
      );

      tsPlayer.on(mpegts.Events.ERROR, (type: string, detail: string, info: unknown) => {
        debugLogWarn("WebPlayer", "erro mpegts.js", {
          type,
          detail,
          info: String(info),
          src: U8(activeUrl)
        });
        if (!fallbackToNextCandidate("mpegts-error")) {
          setDiagnostic("Falha ao processar MPEG-TS no player web.");
          handlersRef.current.onError?.();
        }
      });
      tsPlayer.on(mpegts.Events.MEDIA_INFO, (info: unknown) => {
        debugLogInfo("WebPlayer", "mpegts media info", { info });
      });

      tsPlayer.attachMediaElement(video);
      tsPlayer.load();
      const playAttempt = tsPlayer.play();
      if (playAttempt) {
        void playAttempt.catch((error: unknown) => {
          debugLogWarn("WebPlayer", "mpegts autoplay falhou", {
            error: error instanceof Error ? error.message : String(error),
            src: U8(activeUrl)
          });
        });
      }
    } else if (hlsMode && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
        maxBufferLength: 90,
        maxMaxBufferLength: 120,
        maxBufferHole: 0.8,
        nudgeOffset: 0.2,
        nudgeMaxRetry: 5,
        appendErrorMaxRetry: 4,
        liveSyncDurationCount: 4,
        liveMaxLatencyDurationCount: 12,
        capLevelOnFPSDrop: true,
        manifestLoadingTimeOut: 20000,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 4
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls?.loadSource(activeUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        tryPlay();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        debugLogWarn("WebPlayer", "erro hls.js", {
          type: data.type,
          details: data.details,
          fatal: String(data.fatal),
          src: U8(activeUrl)
        });

        if (
          !data.fatal &&
          (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR ||
            data.details === Hls.ErrorDetails.BUFFER_NUDGE_ON_STALL)
        ) {
          stallCount += 1;
          if (stallCount >= 3) {
            fallbackToNextCandidate(`hls-${data.details}`);
          }
          return;
        }

        if (!data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsNetworkRetries += 1;
          if (hlsNetworkRetries > 4) {
            if (!fallbackToNextCandidate("hls-network-error")) {
              setDiagnostic("Falha recorrente de rede ao carregar o stream.");
              handlersRef.current.onError?.();
            }
            return;
          }
          setDiagnostic("Falha temporaria de rede. Tentando reconectar...");
          hls?.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsRecoveries += 1;
          if (hlsRecoveries > 2) {
            if (!fallbackToNextCandidate("hls-media-error")) {
              setDiagnostic("Falha recorrente ao decodificar o video no player web.");
              handlersRef.current.onError?.();
            }
            return;
          }
          setDiagnostic("Falha ao decodificar video. Tentando recuperar o player...");
          hls?.recoverMediaError();
          return;
        }

        if (!fallbackToNextCandidate("hls-fatal-error")) {
          setDiagnostic("Nao foi possivel reproduzir este stream HLS.");
          handlersRef.current.onError?.();
        }
      });

      hls.attachMedia(video);
    } else {
      video.src = activeUrl;
      video.load();
      tryPlay();
    }

    return () => {
      disposedRef.current = true;
      window.clearTimeout(codecWatchTimer);
      window.clearTimeout(stallTimer);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", onLoadedDataEvent);
      video.removeEventListener("playing", onPlayingEvent);
      video.removeEventListener("pause", onPauseEvent);
      video.removeEventListener("waiting", onWaitingEvent);
      video.removeEventListener("ended", onEndedEvent);
      video.removeEventListener("timeupdate", onTimeUpdateEvent);
      video.removeEventListener("durationchange", onDurationChangeEvent);
      video.removeEventListener("error", onErrorEvent);
      hls?.destroy();
      tsPlayer?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
      handlersRef.current.onDispose?.();
    };
  }, [activeIndex, activeUrl, isLive, playbackCandidates]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.volume = volume;
    video.muted = muted;
  }, [muted, volume]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const toggleFullscreen = () => {
    const root = videoRef.current?.parentElement;
    if (!root) {
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void root.requestFullscreen();
    }
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !duration) {
      return;
    }
    video.currentTime = value;
    setCurrentTime(value);
  };

  const progress = duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 100;

  return (
    <div className={`lipptv-web-player ${className ?? ""}`.trim()}>
      <video
        ref={videoRef}
        className="lipptv-web-video"
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        onContextMenu={(event) => event.preventDefault()}
      />
      <div className="web-player-controls">
        <div className="web-player-progress">
          <span style={{ width: `${progress}%` }} />
          {!isLive && duration > 0 ? (
            <input
              aria-label="Progresso"
              type="range"
              min="0"
              max={duration}
              step="1"
              value={currentTime}
              onChange={(event) => seek(Number(event.target.value))}
            />
          ) : null}
        </div>
        <div className="web-player-actions">
          <button type="button" className="web-control-button" onClick={togglePlayback}>
            {paused ? "Play" : "Pause"}
          </button>
          <span className={buffering ? "web-player-state visible" : "web-player-state"}>
            A carregar
          </span>
          <button type="button" className="web-control-button" onClick={toggleFullscreen}>
            Tela cheia
          </button>
        </div>
      </div>
      {diagnostic ? (
        <div className="player-diagnostic">
          <strong>Imagem indisponivel neste stream</strong>
          <span>{diagnostic}</span>
        </div>
      ) : null}
    </div>
  );
}
