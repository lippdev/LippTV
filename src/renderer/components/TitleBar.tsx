import { useEffect, useState } from "react";
import { CloseIcon, MaximizeIcon, MinimizeIcon, RestoreIcon } from "./icons";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    return window.lipptv.onMaximizedChange(setIsMaximized);
  }, []);

  return (
    <header className="titlebar">
      <div className="titlebar-drag" />
      <div className="titlebar-actions">
        <button type="button" aria-label="Minimizar" title="Minimizar" onClick={() => void window.lipptv.minimizeWindow()}>
          <MinimizeIcon />
        </button>
        <button
          type="button"
          aria-label={isMaximized ? "Restaurar" : "Maximizar"}
          title={isMaximized ? "Restaurar" : "Maximizar"}
          onClick={async () => setIsMaximized(await window.lipptv.toggleMaximizeWindow())}
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button type="button" aria-label="Fechar" title="Fechar" className="titlebar-close" onClick={() => void window.lipptv.closeWindow()}>
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}
