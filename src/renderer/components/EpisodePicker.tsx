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
  return (
    <div className="episode-picker">
      <div className="panel-header">
        <h3>Episódios</h3>
      </div>
      {loading ? <p className="muted">{pt.catalog.episodesLoading}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && !error && episodes.length === 0 ? (
        <p className="muted">{pt.catalog.noEpisodes}</p>
      ) : null}
      <div className="episode-list">
        {episodes.map((episode) => (
          <button
            key={episode.id}
            type="button"
            className={clsx("episode-row", { active: activeId === episode.id })}
            onClick={() => onSelect(episode)}
          >
            {episode.name}
          </button>
        ))}
      </div>
    </div>
  );
}
