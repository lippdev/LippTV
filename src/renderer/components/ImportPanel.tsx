import { useState } from "react";
import type { ImportInput, SourceKind } from "@shared/types";
import clsx from "clsx";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";

const sourceModes: { value: SourceKind; label: string }[] = [
  { value: "m3u", label: "M3U / M3U8" },
  { value: "xtream", label: "Xtream Codes" }
];

type ImportPanelProps = {
  className?: string;
};

export function ImportPanel({ className }: ImportPanelProps) {
  const importSource = useAppStore((state) => state.importSource);
  const importing = useAppStore((state) => state.importing);
  const error = useAppStore((state) => state.error);
  const [form, setForm] = useState<ImportInput>({
    type: "m3u",
    name: "",
    url: ""
  });

  async function openLocalFile() {
    const filePath = await window.lipptv.openPlaylistDialog();
    if (!filePath) {
      return;
    }

    setForm((current) => ({
      ...current,
      filePath,
      url: undefined
    }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await importSource(form);
    setForm({ type: form.type, name: "", url: "", epgUrl: "" });
  }

  return (
    <section className={clsx("panel import-panel", className)}>
      <div className="panel-header">
        <div>
          <h2>{pt.import.title}</h2>
          <p>{pt.import.subtitle}</p>
        </div>
      </div>

      <form className="import-form" onSubmit={(event) => void onSubmit(event)}>
        <label>
          {pt.import.sourceType}
          <select
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({ ...current, type: event.target.value as SourceKind }))
            }
          >
            {sourceModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          {pt.import.displayName}
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Minha lista principal"
            required
          />
        </label>

        {form.type === "m3u" && (
          <>
            <label>
              {pt.import.playlistUrl}
              <input
                value={form.url ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, url: event.target.value, filePath: undefined }))
                }
                placeholder="https://exemplo.com/lista.m3u"
              />
            </label>
            <button type="button" className="ghost-button" onClick={() => void openLocalFile()}>
              {pt.import.selectFile}
            </button>
            {form.filePath ? <small>{form.filePath}</small> : null}
            <label>
              {pt.import.epgUrl}
              <input
                value={form.epgUrl ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, epgUrl: event.target.value }))}
                placeholder="https://exemplo.com/epg.xml"
              />
              <small className="muted-inline">{pt.import.epgHint}</small>
            </label>
          </>
        )}

        {form.type === "xtream" && (
          <>
            <label>
              URL do servidor
              <input
                value={form.url ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                placeholder="http://servidor:porta"
                required
              />
            </label>
            <label>
              Utilizador
              <input
                value={form.username ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                required
              />
            </label>
            <label>
              Palavra-passe
              <input
                type="password"
                value={form.password ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </label>
            <label>
              {pt.import.epgUrl}
              <input
                value={form.epgUrl ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, epgUrl: event.target.value }))}
                placeholder="https://exemplo.com/epg.xml"
              />
            </label>
          </>
        )}

        <button type="submit" className="primary-button" disabled={importing}>
          {importing ? pt.import.importing : pt.import.import}
        </button>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </section>
  );
}
