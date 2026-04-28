import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ContentItem, HistoryRecord } from "@shared/types";
import clsx from "clsx";
import { pt } from "../i18n/pt";
import { MediaLogo } from "./MediaLogo";

export type MediaGridEntry = {
  item: ContentItem;
  sourceId: string;
};

type Props = {
  entries: MediaGridEntry[];
  activeId?: string;
  history: HistoryRecord[];
  onSelect: (item: ContentItem) => void;
};

const CARD_MIN_WIDTH = 148;
const ROW_HEIGHT = 296;
const GAP = 14;

function matchHistory(history: HistoryRecord[], itemId: string, sourceId: string) {
  return history.find((entry) => entry.itemId === itemId && entry.sourceId === sourceId);
}

function PlayOverlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="play-icon">
      <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
      <path d="M10 8.5l6 3.5-6 3.5V8.5Z" fill="#fff" />
    </svg>
  );
}

export function MediaGrid({ entries, activeId, history, onSelect }: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const columns = useMemo(() => {
    const width = parentRef.current?.clientWidth ?? 900;
    return Math.max(2, Math.floor((width + GAP) / (CARD_MIN_WIDTH + GAP)));
  }, [entries.length]);
  const rowCount = Math.ceil(entries.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + GAP,
    overscan: 4
  });

  return (
    <div ref={parentRef} className="media-grid-virtual">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative"
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columns;
          const rowEntries = entries.slice(start, start + columns);

          return (
            <div
              key={virtualRow.key}
              className="media-grid-row"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
              }}
            >
              {rowEntries.map(({ item, sourceId }) => {
                const h = matchHistory(history, item.id, sourceId);
                const progress =
                  h?.positionMs && item.streamUrl
                    ? Math.min(100, Math.round((h.positionMs / (1000 * 60 * 120)) * 100))
                    : 0;
                const isActive = activeId === item.id;

                return (
                  <button
                    key={`${sourceId}-${item.id}`}
                    type="button"
                    className={clsx("media-card", { active: isActive })}
                    onClick={() => onSelect(item)}
                    title={item.name}
                  >
                    <div className="media-card-poster">
                      {item.logo ? (
                        <img src={item.logo} alt="" loading="lazy" referrerPolicy="no-referrer" />
                      ) : (
                        <MediaLogo name={item.name} className="media-card-logo-fallback" />
                      )}
                      <div className="media-card-overlay">
                        <PlayOverlayIcon />
                      </div>
                      {h?.positionMs ? <span className="media-card-resume">{pt.vod.resume}</span> : null}
                      {isActive && (
                        <span className="media-card-active-badge">▶ Assistindo</span>
                      )}
                    </div>
                    <div className="media-card-meta">
                      <strong>{item.name}</strong>
                      {item.group ? <span>{item.group}</span> : null}
                    </div>
                    {progress > 0 ? (
                      <div className="media-card-progress">
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
