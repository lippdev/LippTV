import { useMemo, useState } from "react";
import type { ContentItem } from "@shared/types";
import clsx from "clsx";
import { pt } from "../i18n/pt";

type Props = {
  episodes: ContentItem[];
  loading: boolean;
  error?: string;
  activeId?: string;
  onSelect: (item: ContentItem) => void;
};

export function EpisodePicker({ episodes, loading, error, activeId, onSelect }: Props) {
  const [activeSeason, setActiveSeason] = useState<string>("all");

  // Group episodes by season (derived from episode.group or name prefix)
  const seasons = useMemo(() => {
    const groups = new Set(episodes.map((ep) => ep.group ?? "").filter(Boolean));
    return ["all", ...Array.from(groups)];
  }, [episodes]);

  const visible = useMemo(() => {
    if (activeSeason === "all") return episodes;
    return episodes.filter((ep) => ep.group === activeSeason);
  }, [episodes, activeSeason]);

  return (
    <div className="episode-picker">
      <div className="episode-picker-header">
        <h3>Episódios</h3>
        <span className="episode-count-badge">{episodes.length}</span>
      </div>

      {loading ? (
        <div className="episode-loading">
          <span className="episode-loading-dots">
            <span /><span /><span />
          </span>
          <p>{pt.catalog.episodesLoading}</p>
        </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && episodes.length === 0 ? (
        <div className="episode-empty">
          <span>📭</span>
          <p>{pt.catalog.noEpisodes}</p>
        </div>
      ) : null}

      {seasons.length > 2 && (
        <div className="season-tabs">
          {seasons.map((s) => (
            <button
              key={s}
              type="button"
              className={clsx("season-tab", { active: activeSeason === s })}
              onClick={() => setActiveSeason(s)}
            >
              {s === "all" ? "Todas" : s}
            </button>
          ))}
        </div>
      )}

      <div className="episode-list">
        {visible.map((episode, idx) => (
          <button
            key={episode.id}
            type="button"
            className={clsx("episode-row", { active: activeId === episode.id })}
            onClick={() => onSelect(episode)}
          >
            <span className="episode-number">{idx + 1}</span>
            <span className="episode-title">{episode.name}</span>
            {activeId === episode.id && <span className="episode-playing-dot" />}
          </button>
        ))}
      </div>
    </div>
  );
}
