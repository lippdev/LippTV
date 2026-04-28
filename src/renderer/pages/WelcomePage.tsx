import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import { ImportPanel } from "../components/ImportPanel";
import { Modal } from "../components/Modal";
import { TitleBar } from "../components/TitleBar";
import { PlusIcon, PlaylistsIcon } from "../components/icons";
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

          <main className="content-panel welcome-content cinematic-brutalism-layout">
            <div className="massive-bg-text">FONTES</div>
            
            <div className="cinematic-track-container">
              <div className="cinematic-header">
                <h2>{pt.welcome.savedSourcesTitle}</h2>
                <p>{hasLibraries ? "Selecione uma playlist para começar ou adicione uma nova." : "Adicione sua primeira playlist para começar."}</p>
              </div>

              {!hasLibraries ? (
                <ImportPanel className="welcome-import-panel" />
              ) : (
                <div className="welcome-sources">
                  <div className="cinematic-track">
                    {snapshot.libraries.map((library) => (
                      <div 
                        key={library.sourceId} 
                        className="playlist-card"
                        onClick={() => navigate("/app/live")}
                      >
                        <div className="playlist-card-icon">
                          <PlaylistsIcon />
                        </div>
                        <div className="playlist-card-meta">
                          <strong>{library.sourceName}</strong>
                          <span>
                            {library.items.length} {pt.catalog.items}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div 
                      className="playlist-card playlist-card-add"
                      onClick={() => setShowAddSource(true)}
                    >
                      <div className="playlist-card-icon">
                        <PlusIcon />
                      </div>
                      <div className="playlist-card-meta">
                        <strong>Nova</strong>
                        <span>Adicionar Fonte</span>
                      </div>
                    </div>
                  </div>

                  <Modal 
                    isOpen={showAddSource} 
                    onClose={() => setShowAddSource(false)}
                    title={pt.welcome.addSource}
                  >
                    <ImportPanel className="welcome-import-panel" />
                  </Modal>
                </div>
              )}
            </div>
          </main>
      </div>
    </div>
  );
}
