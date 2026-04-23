import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ContentItem } from "@shared/types";
import clsx from "clsx";
import { MediaLogo } from "./MediaLogo";

type Props = {
  items: ContentItem[];
  activeId?: string;
  onSelect: (item: ContentItem) => void;
  variant?: "default" | "live";
};

export function LibraryVirtualList({ items, activeId, onSelect, variant = "default" }: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rows = useMemo(() => items, [items]);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (variant === "live" ? 76 : 72),
    overscan: 8
  });

  return (
    <div ref={parentRef} className={variant === "live" ? "virtual-list virtual-list-live" : "virtual-list"}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative"
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = rows[virtualRow.index];
          return (
            <button
              key={item.id}
              className={clsx(
                variant === "live" ? "channel-row-live" : "media-row",
                { active: activeId === item.id }
              )}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`
              }}
              onClick={() => onSelect(item)}
            >
              <MediaLogo src={item.logo} name={item.name} className="media-thumb" />
              <div className="media-copy">
                <strong>{item.name}</strong>
                <span>{item.group}</span>
              </div>
              {variant === "live" ? (
                <span className="live-badge">Live</span>
              ) : (
                <span className="media-type">{item.type}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
