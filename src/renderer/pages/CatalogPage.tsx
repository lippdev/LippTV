import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContentItem, ContentType } from "@shared/types";
import { EpisodePicker } from "../components/EpisodePicker";
import { LibraryVirtualList } from "../components/LibraryVirtualList";
import { PlayerView } from "../components/PlayerView";
import { FilterIcon, SearchIcon } from "../components/icons";
import { pt } from "../i18n/pt";
import { debugLogInfo } from "../lib/debugLog";
import { useAppStore } from "../stores/appStore";

type SortMode = "default" | "az" | "za";

type Props = {
  mode: ContentType;
};

type Row = { item: ContentItem; sourceId: string };

export function CatalogPage({ mode }: Props) {
  const snapshot = useAppStore((state) => state.snapshot);
  const selectedItem = useAppStore((state) => state.selectedItem);
  const setSelectedItem = useAppStore((state) => state.setSelectedItem);

  const selectItem = useCallback(
    (item: ContentItem) => {
      debugLogInfo("Catálogo", "seleção", {
        mode,
        id: item.id,
        name: item.name,
        hasStream: Boolean(item.streamUrl)
      });
      setSelectedItem(item);
    },
    [mode, setSelectedItem]
  );

  const [query, setQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [category, setCategory] = useState<string>("__all__");
  const [sort, setSort] = useState<SortMode>("default");
  const [episodes, setEpisodes] = useState<ContentItem[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState<string>();
  const [episodeSourceId, setEpisodeSourceId] = useState<string>();

  // Reset state when switching between movies and series
  useEffect(() => {
    setCategory("__all__");
    setQuery("");
    setCategoryQuery("");
    setSort("default");
  }, [mode]);

  // All rows for current mode
  const rows = useMemo<Row[]>(
    () =>
      snapshot.libraries.flatMap((library) =>
        library.items
          .filter((item) => item.type === mode)
          .map((item) => ({ item, sourceId: library.sourceId }))
      ),
    [snapshot.libraries, mode]
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const g = row.item.group ?? "";
      map.set(g, (map.get(g) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  // Sorted category list
  const categories = useMemo(() => {
    const set = new Set(rows.map((row) => row.item.group ?? ""));
    return ["__all__", ...Array.from(set).sort((a, b) => a.localeCompare(b, "pt"))];
  }, [rows]);

  // Categories filtered by sidebar search
  const visibleCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((cat) => {
      const label = cat === "__all__" ? "Todos" : cat;
      return label.toLowerCase().includes(q);
    });
  }, [categories, categoryQuery]);

  // Items filtered by category + search + sort
  const filtered = useMemo<Row[]>(() => {
    let list = rows;
    if (category !== "__all__") {
      list = list.filter((row) => (row.item.group ?? "") === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((row) => row.item.name.toLowerCase().includes(q));
    }
    if (sort === "az") list = [...list].sort((a, b) => a.item.name.localeCompare(b.item.name));
    if (sort === "za") list = [...list].sort((a, b) => b.item.name.localeCompare(a.item.name));
    return list;
  }, [rows, category, query, sort]);

  const items = useMemo(() => filtered.map((row) => row.item), [filtered]);

  // ── Source ID for player — must come from rows (not filtered) so it survives category changes
  const activeSourceId = useMemo(
    () => rows.find((row) => row.item.id === selectedItem?.id)?.sourceId,
    [rows, selectedItem?.id]
  );

  const seriesSourceId =
    selectedItem?.type === "series" && selectedItem.seriesId
      ? rows.find((r) => r.item.id === selectedItem.id)?.sourceId
      : undefined;

  // Episode loading for series
  useEffect(() => {
    if (mode !== "series") {
      setEpisodes([]);
      setEpisodesError(undefined);
      setEpisodeSourceId(undefined);
      return;
    }

    const stub =
      selectedItem?.type === "series" &&
      Boolean(selectedItem.seriesId) &&
      !selectedItem.streamUrl;

    if (!stub) {
      setEpisodes([]);
      setEpisodesError(undefined);
      if (!selectedItem || selectedItem.type !== "series") {
        setEpisodeSourceId(undefined);
      }
      return;
    }

    if (!seriesSourceId) return;
    setEpisodeSourceId(seriesSourceId);

    const seriesId = selectedItem.seriesId;
    if (!seriesId) return;

    let cancelled = false;
    setEpisodesLoading(true);
    setEpisodesError(undefined);

    void window.lipptv
      .listXtreamEpisodes({ sourceId: seriesSourceId, seriesId })
      .then((list) => { if (!cancelled) setEpisodes(list); })
      .catch((error: unknown) => {
        if (!cancelled) setEpisodesError(error instanceof Error ? error.message : pt.catalog.episodesError);
      })
      .finally(() => { if (!cancelled) setEpisodesLoading(false); });

    return () => { cancelled = true; };
  }, [mode, selectedItem?.id, selectedItem?.seriesId, selectedItem?.streamUrl, seriesSourceId]);

  const title = mode === "movie" ? pt.nav.movies : pt.nav.series;

  // ── Sidebar: category list (same pattern as Live TV)
  const categorySidebar = (
    <section className="panel catalog-cat-panel">
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
          onChange={(e) => setCategoryQuery(e.target.value)}
          placeholder="Filtrar categorias"
        />
      </div>
      <div className="category-list category-list-mock">
        {visibleCategories.map((cat) => {
          const count = cat === "__all__" ? rows.length : categoryCounts.get(cat) ?? 0;
          const label = cat === "__all__" ? "Todos" : cat;
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
  );

  // ── Centre: item list (same pattern as Live TV channels)
  const itemList = (
    <section className="panel catalog-items-panel">
      <div className="panel-header live-mock-ch-head">
        <div>
          <h2>{title}</h2>
          <p className="live-count-line">
            <span className="live-count-num">{filtered.length}</span> {pt.catalog.items}
          </p>
        </div>
        <div className="catalog-list-controls">
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Ordenar"
          >
            <option value="default">Original</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
          <div className="live-search-wrap">
            <span className="live-search-icon" aria-hidden>
              <SearchIcon />
            </span>
            <input
              className="search-input live-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === "movie" ? "Buscar filme..." : "Buscar série..."}
            />
          </div>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="catalog-list-empty">
          <span>{mode === "movie" ? "🎬" : "📺"}</span>
          <p>{query ? `Sem resultados para "${query}"` : "Nenhum item nesta categoria"}</p>
        </div>
      ) : (
        <LibraryVirtualList
          items={items}
          activeId={selectedItem?.id}
          onSelect={selectItem}
        />
      )}
    </section>
  );

  // ── MOVIE MODE: categories | list | player
  if (mode === "movie") {
    return (
      <div className="page catalog-vod-page">
        {categorySidebar}
        {itemList}
        <PlayerView item={selectedItem} sourceId={activeSourceId} />
      </div>
    );
  }

  // ── SERIES MODE: categories | list | [episodes] | player
  if (mode === "series") {
    const inLibrary = selectedItem
      ? rows.some((row) => row.item.id === selectedItem.id)
      : false;
    const playSourceId = inLibrary ? activeSourceId : episodeSourceId ?? activeSourceId;
    const showEpisodePanel = Boolean(selectedItem?.seriesId && !selectedItem.streamUrl);

    return (
      <div className={`page catalog-vod-page${showEpisodePanel ? " catalog-series-has-episodes" : ""}`}>
        {categorySidebar}
        {itemList}
        {showEpisodePanel && (
          <section className="panel catalog-episode-panel">
            <EpisodePicker
              episodes={episodes}
              loading={episodesLoading}
              error={episodesError}
              activeId={selectedItem?.streamUrl ? selectedItem.id : undefined}
              onSelect={selectItem}
            />
          </section>
        )}
        <PlayerView item={selectedItem} sourceId={playSourceId} />
      </div>
    );
  }

  return null;
}
