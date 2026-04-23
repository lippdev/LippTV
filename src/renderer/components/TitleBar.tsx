import { BrandLogo } from "./BrandLogo";

export function TitleBar() {
  return (
    <header className="titlebar">
      <div className="titlebar-drag">
        <div className="titlebar-brand">
          <BrandLogo className="titlebar-logo" />
          <span>LippTV</span>
        </div>
      </div>
      <div className="titlebar-actions">
        <button type="button" aria-label="Minimizar" onClick={() => void window.lipptv.minimizeWindow()}>
          -
        </button>
        <button
          type="button"
          aria-label="Maximizar"
          onClick={() => void window.lipptv.toggleMaximizeWindow()}
        >
          []
        </button>
        <button type="button" aria-label="Fechar" className="titlebar-close" onClick={() => void window.lipptv.closeWindow()}>
          X
        </button>
      </div>
    </header>
  );
}
