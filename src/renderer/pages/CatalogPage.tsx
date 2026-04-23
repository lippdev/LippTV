import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContentItem, ContentType } from "@shared/types";
import { EpisodePicker } from "../components/EpisodePicker";
import { LibraryVirtualList } from "../components/LibraryVirtualList";
import { MediaGrid, type MediaGridEntry } from "../components/MediaGrid";
import { PlayerView } from "../components/PlayerView";
import { pt } from "../i18n/pt";
import { debugLogInfo } from "../lib/debugLog";
import { useAppStore } from "../stores/appStore";

type Props = {
  mode: ContentType;
};

export function CatalogPage({ mode }: Props) {
  const snapshot = useAppStore((state) => state.snapshot);
  const selectedItem = useAppStore((state) => state.selectedItem);
  const setSelectedItem = useAppStore((state) => state.setSelectedItem);
  const selectItem = useCallback(
    (item: ContentItem) => {
      debugLogInfo("Catálogo", "seleção", { mode, id: item.id, name: item.name, hasStream: Boolean(item.streamUrl) });
      setSelectedItem(item);
    },
    [mode, setSelectedItem]
  );
  const [query, setQuery] = useState("");
  const [episodes, setEpisodes] = useState<ContentItem[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState<string>();
  const [episodeSourceId, setEpisodeSourceId] = useState<string>();

  const libraries = snapshot.libraries;

  const rows = useMemo(
    () =>
      libraries.flatMap((library) =>
        library.items
          .filter((item) => item.type === mode)
          .map((item) => ({ item, sourceId: library.sourceId }))
      ),
    [libraries, mode]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(({ item }) => item.name.toLowerCase().includes(q));
  }, [query, rows]);

  const activeSourceId = rows.find((entry) => entry.item.id === selectedItem?.id)?.sourceId;

  const seriesSourceId =
    selectedItem?.type === "series" && selectedItem.seriesId
      ? rows.find((r) => r.item.id === selectedItem.id)?.sourceId
      : undefined;

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

    if (!seriesSourceId) {
      return;
    }

    setEpisodeSourceId(seriesSourceId);
    const seriesId = selectedItem.seriesId;
    if (!seriesId) {
      return;
    }
    let cancelled = false;
    setEpisodesLoading(true);
    setEpisodesError(undefined);
    void window.lipptv
      .listXtreamEpisodes({ sourceId: seriesSourceId, seriesId })
      .then((list) => {
        if (!cancelled) {
          setEpisodes(list);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setEpisodesError(error instanceof Error ? error.message : pt.catalog.episodesError);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setEpisodesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode, selectedItem?.id, selectedItem?.seriesId, selectedItem?.streamUrl, seriesSourceId]);

  const gridEntries: MediaGridEntry[] = useMemo(() => filtered, [filtered]);

  const title =
    mode === "movie" ? pt.nav.movies : mode === "series" ? pt.nav.series : pt.nav.live;

  if (mode === "movie") {
    return (
      <div className="page catalog-vod-layout">
        <section className="panel catalog-vod-main">
          <div className="panel-header">
            <div>
              <h2>{title}</h2>
              <p>
                {filtered.length} {pt.catalog.items}
              </p>
            </div>
            <input
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={pt.catalog.search}
            />
          </div>
          <div className="vod-scroll">
            <MediaGrid
              entries={gridEntries}
              activeId={selectedItem?.id}
              history={snapshot.history}
              onSelect={selectItem}
            />
          </div>
        </section>
        <PlayerView item={selectedItem} sourceId={activeSourceId} />
      </div>
    );
  }

  if (mode === "series") {
    const inLibrary = selectedItem
      ? rows.some((row) => row.item.id === selectedItem.id)
      : false;
    const playSourceId = inLibrary ? activeSourceId : episodeSourceId ?? activeSourceId;

    const showEpisodePanel = Boolean(selectedItem?.seriesId && !selectedItem.streamUrl);

    return (
      <div className={showEpisodePanel ? "page catalog-series-layout has-episodes" : "page catalog-series-layout"}>
        <section className="panel catalog-series-grid-panel">
          <div className="panel-header">
            <div>
              <h2>{title}</h2>
              <p>
                {filtered.length} {pt.catalog.items}
              </p>
            </div>
            <input
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={pt.catalog.search}
            />
          </div>
          <div className="vod-scroll">
            <MediaGrid
              entries={gridEntries}
              activeId={selectedItem?.id}
              history={snapshot.history}
              onSelect={selectItem}
            />
          </div>
        </section>

        {showEpisodePanel ? (
          <section className="panel catalog-episode-panel">
            <EpisodePicker
              episodes={episodes}
              loading={episodesLoading}
              error={episodesError}
              activeId={selectedItem?.streamUrl ? selectedItem.id : undefined}
              onSelect={selectItem}
            />
          </section>
        ) : null}

        <PlayerView item={selectedItem} sourceId={playSourceId} />
      </div>
    );
  }

  return (
    <div className="page catalog-grid">
      <section className="panel catalog-panel">
        <div className="panel-header">
          <div>
            <h2>{title}</h2>
            <p>
              {filtered.length} {pt.catalog.items}
            </p>
          </div>
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={pt.catalog.search}
          />
        </div>
        <LibraryVirtualList
          items={filtered.map((entry) => entry.item)}
          activeId={selectedItem?.id}
          onSelect={selectItem}
        />
      </section>
      <PlayerView item={selectedItem} sourceId={activeSourceId} />
    </div>
  );
}
