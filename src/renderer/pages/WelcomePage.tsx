import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { ImportPanel } from "../components/ImportPanel";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";

export function WelcomePage() {
  const navigate = useNavigate();
  const snapshot = useAppStore((state) => state.snapshot);
  const [showAddSource, setShowAddSource] = useState(false);

  const hasLibraries = snapshot.libraries.length > 0;

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="welcome-brand">
          <div className="welcome-brand-mark">
            <BrandLogo />
          </div>
          <div>
            <h1>LippTV</h1>
            <p>{pt.welcome.tagline}</p>
          </div>
        </div>

        {!hasLibraries ? (
          <ImportPanel className="welcome-import-panel" />
        ) : (
          <div className="welcome-sources">
            <p className="welcome-lead">{pt.welcome.hasSourcesLead}</p>
            <ul className="welcome-source-list">
              {snapshot.libraries.map((library) => (
                <li key={library.sourceId} className="welcome-source-row">
                  <div>
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
      </div>
    </div>
  );
}
