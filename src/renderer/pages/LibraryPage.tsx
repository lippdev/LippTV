import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";

export function LibraryPage() {
  const snapshot = useAppStore((state) => state.snapshot);
  const refreshSource = useAppStore((state) => state.refreshSource);
  const removeSource = useAppStore((state) => state.removeSource);
  const error = useAppStore((state) => state.error);
  const [busyId, setBusyId] = useState<string>();

  async function onRefresh(sourceId: string) {
    setBusyId(sourceId);
    try {
      await refreshSource(sourceId);
    } finally {
      setBusyId(undefined);
    }
  }

  async function onRemove(sourceId: string) {
    if (!window.confirm(pt.library.confirmRemove)) {
      return;
    }
    setBusyId(sourceId);
    try {
      await removeSource(sourceId);
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <div className="page">
      {error ? <p className="error-text">{error}</p> : null}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{pt.library.title}</h2>
            <p>{pt.library.subtitle}</p>
          </div>
        </div>

        <div className="source-grid">
          {snapshot.libraries.map((library) => (
            <article key={library.sourceId} className="source-card">
              <strong>{library.sourceName}</strong>
              <span>
                {library.items.length} {pt.library.items}
              </span>
              <span>
                {library.stats.groups} {pt.library.groups}
              </span>
              <small>
                {pt.library.updated}{" "}
                {formatDistanceToNow(library.importedAt, { addSuffix: true, locale: ptBR })}
              </small>
              <div className="source-card-actions">
                <button
                  type="button"
                  className="ghost-button"
                  disabled={busyId === library.sourceId}
                  onClick={() => void onRefresh(library.sourceId)}
                >
                  {pt.library.refresh}
                </button>
                <button
                  type="button"
                  className="ghost-button danger"
                  disabled={busyId === library.sourceId}
                  onClick={() => void onRemove(library.sourceId)}
                >
                  {pt.library.remove}
                </button>
              </div>
            </article>
          ))}
          {snapshot.libraries.length === 0 ? (
            <article className="empty-state">
              <strong>{pt.library.empty}</strong>
              <p>{pt.library.emptyHint}</p>
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}
