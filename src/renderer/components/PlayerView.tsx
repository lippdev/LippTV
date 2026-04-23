import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContentItem } from "@shared/types";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";
import { debugLogInfo, debugLogWarn } from "../lib/debugLog";
import { normaliseStreamUrlForPlayback } from "../lib/streamUrl";
import { type PlayerHandle, VideoJsPlayer } from "./VideoJsPlayer";

type Props = {
  item?: ContentItem;
  sourceId?: string;
  variant?: "default" | "live";
  nowNext?: { current?: string; next?: string };
};

type PlayerStatus =
  | "idle"
  | "ready"
  | "playing"
  | "paused"
  | "buffering"
  | "error"
  | "reconnecting";

const STATUS_PT: Record<PlayerStatus, keyof typeof pt.player> = {
  idle: "statusIdle",
  ready: "statusReady",
  playing: "statusPlaying",
  paused: "statusPaused",
  buffering: "statusBuffering",
  error: "statusError",
  reconnecting: "statusReconnecting"
};

export function PlayerView({ item, sourceId, variant = "default", nowNext }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<PlayerHandle | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const snapshot = useAppStore((state) => state.snapshot);
  const playback = snapshot.playback;
  const pushHistory = useAppStore((state) => state.pushHistory);
  const setPlayback = useAppStore((state) => state.setPlayback);
  const setSelectedItem = useAppStore((state) => state.setSelectedItem);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const isFavorite =
    item && sourceId
      ? snapshot.favorites.some((f) => f.itemId === item.id && f.sourceId === sourceId)
      : false;

  const sourceUrl = item?.streamUrl;
  const playbackUrl = useMemo(
    () => normaliseStreamUrlForPlayback(sourceUrl, item?.type),
    [sourceUrl, item?.type]
  );
  const isSeriesStub = item?.type === "series" && item.seriesId && !sourceUrl;
  const statusLabel = pt.player[STATUS_PT[status]];

  useEffect(() => {
    if (!item) {
      return;
    }
    debugLogInfo("PlayerView", "item selecionado", {
      id: item.id,
      name: item.name,
      type: item.type,
      hasStream: Boolean(item.streamUrl),
      playback: playbackUrl?.slice(0, 120),
      sourceId: sourceId ?? ""
    });
  }, [item, playbackUrl, sourceId]);

  useEffect(() => {
    const onFs = () => setFullscreenActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const flushHistory = useCallback(() => {
    if (!item || !sourceId || !sourceUrl) {
      return;
    }
    let currentTime = 0;
    try {
      const p = playerRef.current;
      if (p && !p.isDisposed()) {
        currentTime = p.currentTime() ?? 0;
      }
    } catch {
      /* player libertado; ignorar */
    }
    void pushHistory(item, sourceId, currentTime * 1000).catch((e) => {
      debugLogWarn("PlayerView", "pushHistory rejeitado", { e: String(e) });
    });
  }, [item, pushHistory, sourceId, sourceUrl]);

  useEffect(() => {
    if (!item || !sourceId || !playbackUrl || isSeriesStub) {
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushHistory();
      }
    };
    const onBeforeUnload = () => flushHistory();

    const timer = window.setInterval(() => flushHistory(), 60000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [flushHistory, item, sourceId, playbackUrl, isSeriesStub]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    if (variant !== "live") {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        const t = e.target as HTMLElement;
        if (t.closest("input, textarea, select, button")) {
          return;
        }
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen, variant]);

  const overlay = useMemo(() => {
    if (variant !== "live" || !item) {
      return null;
    }
    return (
      <div className="player-overlay">
        <div className="player-overlay-text">
          <strong>{item.name}</strong>
          <span>{item.group}</span>
          {nowNext?.current ? (
            <span className="player-overlay-epg">
              <em>{pt.catalog.epgNow}:</em> {nowNext.current}
            </span>
          ) : null}
          {nowNext?.next ? (
            <span className="player-overlay-epg">
              <em>{pt.catalog.epgNext}:</em> {nowNext.next}
            </span>
          ) : null}
        </div>
        <span className="player-overlay-status">{statusLabel}</span>
      </div>
    );
  }, [item, nowNext?.current, nowNext?.next, statusLabel, variant]);

  if (isSeriesStub) {
    return (
      <section className={`panel player-panel ${variant === "live" ? "player-panel-live" : ""}`}>
        <div className="panel-header">
          <div>
            <h2>{item?.name}</h2>
            <p>{pt.catalog.selectEpisode}</p>
          </div>
        </div>
        <div className="player-frame player-frame-placeholder">
          <p>{pt.catalog.selectEpisode}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`panel player-panel ${variant === "live" ? "player-panel-live" : ""}`}>
      {variant === "default" ? (
        <div className="panel-header">
          <div>
            <h2>{item?.name ?? pt.player.selectToPlay}</h2>
            <p>{statusLabel}</p>
          </div>
        </div>
      ) : (
        <div className="panel-header panel-header-live-mock">
          <div className="player-header-title">
            <h2>{item?.name ?? pt.catalog.selectChannel}</h2>
            <button
              type="button"
              className={isFavorite ? "icon-button heart-filled" : "icon-button heart-outline"}
              aria-label={pt.player.favorite}
              disabled={!item || !sourceId}
              onClick={() => item && sourceId && void toggleFavorite(item, sourceId)}
            >
              ♥
            </button>
          </div>
          <div className="player-badges">
            <span className="badge-fhd">FHD</span>
            <button
              type="button"
              className="ghost-button ghost-button-sm stop-channel-button"
              disabled={!item}
              onClick={() => setSelectedItem(undefined)}
            >
              Parar
            </button>
            <button type="button" className="ghost-button ghost-button-sm" onClick={() => toggleFullscreen()}>
              {fullscreenActive ? pt.player.exitFullscreen : pt.player.fullscreen}
            </button>
          </div>
        </div>
      )}

      <div ref={containerRef} className={`player-frame ${variant === "live" ? "player-frame-live" : ""}`}>
        {playbackUrl ? (
          <VideoJsPlayer
            key={playbackUrl}
            sourceUrl={playbackUrl}
            volume={playback.volume}
            muted={playback.muted}
            isLive={variant === "live"}
            className="lipptv-web-player-wrap"
            onReady={(p) => {
              playerRef.current = p;
            }}
            onDispose={() => {
              playerRef.current = null;
            }}
            onLoadedData={() => setStatus("ready")}
            onPlaying={() => setStatus("playing")}
            onPause={() => {
              setStatus("paused");
              flushHistory();
            }}
            onWaiting={() => setStatus("buffering")}
            onError={() => setStatus("error")}
            onEnded={() => {
              setStatus("idle");
              flushHistory();
            }}
          />
        ) : null}
        {overlay}
      </div>

      <div className="player-toolbar player-toolbar-mock">
        <label>
          {pt.player.volume}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={playback.volume}
            onChange={(event) => {
              void setPlayback({
                ...playback,
                volume: Number(event.target.value)
              }).catch((e) => {
                debugLogWarn("PlayerView", "setPlayback rejeitado (volume)", { e: String(e) });
              });
            }}
          />
        </label>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            void setPlayback({
              ...playback,
              muted: !playback.muted
            }).catch((e) => {
              debugLogWarn("PlayerView", "setPlayback rejeitado (mudo)", { e: String(e) });
            });
          }}
        >
          {playback.muted ? pt.player.unmute : pt.player.mute}
        </button>
        <button type="button" className="ghost-button" onClick={() => toggleFullscreen()}>
          {pt.player.fullscreen}
        </button>
      </div>
    </section>
  );
}
