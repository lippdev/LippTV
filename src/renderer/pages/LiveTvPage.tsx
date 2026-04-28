import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContentItem } from "@shared/types";
import { FilterIcon, SearchIcon } from "../components/icons";
import { LibraryVirtualList } from "../components/LibraryVirtualList";
import { PlayerView } from "../components/PlayerView";
import {
  formatEpgTimeRange,
  getEpgNowNext,
  getEpgNowNextBlocks,
  progressInProgram
} from "../lib/epgSchedule";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";
import { debugLogInfo } from "../lib/debugLog";

type Row = { item: ContentItem; sourceId: string };

export function LiveTvPage() {
  const snapshot = useAppStore((state) => state.snapshot);
  const selectedItem = useAppStore((state) => state.selectedItem);
  const setSelectedItem = useAppStore((state) => state.setSelectedItem);
  const [query, setQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [category, setCategory] = useState<string>("__all__");

  const rows: Row[] = useMemo(
    () =>
      snapshot.libraries.flatMap((library) =>
        library.items
          .filter((item) => item.type === "live")
          .map((item) => ({ item, sourceId: library.sourceId }))
      ),
    [snapshot.libraries]
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.item.group, (map.get(row.item.group) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  const categories = useMemo(() => {
    const set = new Set(rows.map((row) => row.item.group));
    return ["__all__", ...Array.from(set).sort((a, b) => (a ?? "").localeCompare(b ?? "", "pt"))];
  }, [rows]);

  const visibleCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) {
      return categories;
    }
    return categories.filter((cat) => {
      const label = cat === "__all__" ? pt.catalog.allCategories : cat;
      return label.toLowerCase().includes(q);
    });
  }, [categories, categoryQuery]);

  const filtered = useMemo(() => {
    let list = rows;
    if (category !== "__all__") {
      list = list.filter((row) => row.item.group === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((row) => row.item.name.toLowerCase().includes(q));
    }
    return list;
  }, [category, query, rows]);

  const items = useMemo(() => filtered.map((row) => row.item), [filtered]);

  const activeSourceId = filtered.find((row) => row.item.id === selectedItem?.id)?.sourceId;
  const activeLibrary = snapshot.libraries.find((lib) => lib.sourceId === activeSourceId);
  const nowNext = useMemo(
    () => getEpgNowNext(activeLibrary?.epg ?? [], selectedItem),
    [activeLibrary?.epg, selectedItem]
  );

  const epgBlocks = useMemo(
    () => getEpgNowNextBlocks(activeLibrary?.epg ?? [], selectedItem),
    [activeLibrary?.epg, selectedItem]
  );

  const now = Date.now();
  const currentProgress =
    epgBlocks.current !== undefined
      ? progressInProgram(now, epgBlocks.current.start, epgBlocks.current.end)
      : 0;
  const remainingMin =
    epgBlocks.current !== undefined
      ? Math.max(0, Math.round((epgBlocks.current.end - now) / 60000))
      : 0;

  const moveSelection = useCallback(
    (delta: number) => {
      if (!filtered.length) {
        return;
      }
      const currentIndex = filtered.findIndex((row) => row.item.id === selectedItem?.id);
      const nextIndex =
        currentIndex === -1
          ? 0
          : Math.min(filtered.length - 1, Math.max(0, currentIndex + delta));
      setSelectedItem(filtered[nextIndex]?.item);
    },
    [filtered, selectedItem?.id, setSelectedItem]
  );

  useEffect(() => {
    if (window.location.hash === "#categorias") {
      document.getElementById("categorias")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select")) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelection(-1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const first = filtered[0]?.item;
        if (!selectedItem && first) {
          setSelectedItem(first);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, moveSelection, selectedItem, setSelectedItem]);

  return (
    <div className="page live-mock-page">
      <div className="live-sidebar-column">
        <section className="panel live-mock-categories" id="categorias">
          <div className="panel-header live-mock-cat-header">
            <h2>{pt.catalog.categories}</h2>
            <span className="icon-filter" aria-hidden>
              <FilterIcon />
            </span>
          </div>
          <div className="category-search-wrap">
            <SearchIcon />
            <input
              value={categoryQuery}
              onChange={(event) => setCategoryQuery(event.target.value)}
              placeholder="Filtrar categorias"
            />
          </div>
          <div className="category-list category-list-mock">
            {visibleCategories.map((cat) => {
              const count =
                cat === "__all__" ? rows.length : categoryCounts.get(cat) ?? 0;
              const label = cat === "__all__" ? pt.catalog.allCategories : cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={cat === category ? "category-pill-mock active" : "category-pill-mock"}
                  onClick={() => setCategory(cat)}
                >
                  <span className="category-pill-label">{label}</span>
                  <span className="category-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel live-mock-channels">
          <div className="panel-header live-mock-ch-head">
            <div>
              <h2>{pt.nav.live}</h2>
              <p className="live-count-line">
                <span className="live-count-num">{filtered.length}</span> {pt.catalog.items}
              </p>
            </div>
            <div className="live-search-wrap">
              <span className="live-search-icon" aria-hidden>
                <SearchIcon />
              </span>
              <input
                className="search-input live-search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={pt.live.channelSearch}
              />
            </div>
          </div>
          <LibraryVirtualList
            variant="live"
            items={items}
            activeId={selectedItem?.id}
            onSelect={(it) => {
              debugLogInfo("LiveTV", "clicou canal", {
                id: it.id,
                name: it.name,
                hasStream: Boolean(it.streamUrl)
              });
              setSelectedItem(it);
            }}
          />
        </section>
      </div>

      <section className="panel live-mock-player-column">
        <PlayerView
          item={selectedItem}
          sourceId={activeSourceId}
          variant="live"
          nowNext={nowNext}
        />

        <div className="live-epg-blocks">
          {epgBlocks.current ? (
            <div className="live-epg-card">
              <div className="live-epg-card-head">
                <span>{pt.live.epgSectionNow}</span>
                <span className="live-epg-time">
                  {formatEpgTimeRange(epgBlocks.current.start, epgBlocks.current.end)}
                </span>
              </div>
              <strong className="live-epg-title">{epgBlocks.current.title}</strong>
              <div className="live-epg-progress">
                <span style={{ width: `${currentProgress}%` }} />
              </div>
              <p className="live-epg-remaining">
                {remainingMin} min {pt.live.remainingHint}
              </p>
            </div>
          ) : null}
          {epgBlocks.next ? (
            <div className="live-epg-card live-epg-card-next">
              <div className="live-epg-card-head">
                <span>{pt.live.epgSectionNext}</span>
                <span className="live-epg-time">
                  {formatEpgTimeRange(epgBlocks.next.start, epgBlocks.next.end)}
                </span>
              </div>
              <strong className="live-epg-title">{epgBlocks.next.title}</strong>
            </div>
          ) : null}
        </div>

        <div className="live-channel-meta">
          <h3>{pt.live.channelInfo}</h3>
          <dl className="live-channel-dl">
            <div>
              <dt>{pt.catalog.categories}</dt>
              <dd>{selectedItem?.group ?? "-"}</dd>
            </div>
            <div>
              <dt>{pt.live.quality}</dt>
              <dd>FHD</dd>
            </div>
            <div>
              <dt>{pt.live.source}</dt>
              <dd>{activeLibrary?.sourceName ?? "-"}</dd>
            </div>
            <div>
              <dt>{pt.live.statusLabel}</dt>
              <dd className="live-status-online">{pt.live.statusOnline}</dd>
            </div>
          </dl>
        </div>

        <div className="live-shortcuts">
          <h3>{pt.live.shortcuts}</h3>
          <ul>
            <li>{pt.live.shortcutFullscreen}</li>
            <li>{pt.live.shortcutMute}</li>
            <li>{pt.live.shortcutNav}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
