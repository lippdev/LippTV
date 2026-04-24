import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import { ImportPanel } from "../components/ImportPanel";
import { TitleBar } from "../components/TitleBar";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";

export function WelcomePage() {
  const navigate = useNavigate();
  const snapshot = useAppStore((state) => state.snapshot);
  const [showAddSource, setShowAddSource] = useState(false);

  const hasLibraries = snapshot.libraries.length > 0;

  return (
    <div className="desktop-shell">
      <TitleBar />
      <div className="app-shell app-shell-welcome">
        <AppSidebar mode="welcome" current="welcome" />

        <main className="content-panel welcome-content">
          <div className="welcome-page-layout">
            <section className="welcome-hero-panel">
              <span className="eyebrow">{pt.welcome.sidebarPlaylists}</span>
              <h1>{pt.welcome.title}</h1>
              <p>{pt.welcome.tagline}</p>
            </section>

            <section className="panel welcome-main-panel">
              <div className="panel-header welcome-panel-header">
                <div>
                  <h2>{hasLibraries ? pt.welcome.savedSourcesTitle : pt.import.title}</h2>
                  <p>{hasLibraries ? pt.welcome.hasSourcesLead : pt.import.subtitle}</p>
                </div>
              </div>

              {!hasLibraries ? (
                <ImportPanel className="welcome-import-panel" />
              ) : (
                <div className="welcome-sources">
                  <ul className="welcome-source-list">
                    {snapshot.libraries.map((library) => (
                      <li key={library.sourceId} className="welcome-source-row">
                        <div className="welcome-source-meta">
                          <strong>{library.sourceName}</strong>
                          <span>
                            {library.items.length} {pt.catalog.items}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {!showAddSource ? (
                    <button
                      type="button"
                      className="ghost-button welcome-add-btn"
                      onClick={() => setShowAddSource(true)}
                    >
                      {pt.welcome.addSource}
                    </button>
                  ) : (
                    <ImportPanel className="welcome-import-panel" />
                  )}
                  <button
                    type="button"
                    className="primary-button welcome-continue"
                    onClick={() => navigate("/app/live")}
                  >
                    {pt.welcome.continueToApp}
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
