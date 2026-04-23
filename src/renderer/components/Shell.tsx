import { NavLink, Outlet } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { MoonIcon, SunIcon } from "./icons";
import { TitleBar } from "./TitleBar";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";

export function Shell() {
  const theme = useAppStore((state) => state.snapshot.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const navClass = ({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <div className="desktop-shell">
      <TitleBar />
      <div className="app-shell">
        <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">
              <BrandLogo />
            </div>
            <div>
              <strong>LippTV</strong>
              <p>{pt.brandSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            className="theme-icon-button"
            aria-label={theme === "dark" ? pt.theme.light : pt.theme.dark}
            title={theme === "dark" ? pt.theme.light : pt.theme.dark}
            onClick={() => void setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="nav-group">
          <span className="nav-group-label">{pt.navGroup.navigation}</span>
          <NavLink to="/app/live" className={navClass} end>
            {pt.nav.live}
          </NavLink>
          <NavLink to="/app/movies" className={navClass}>
            {pt.nav.movies}
          </NavLink>
          <NavLink to="/app/series" className={navClass}>
            {pt.nav.series}
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-group-label">{pt.navGroup.explore}</span>
          <NavLink to="/app/live#categorias" className={navClass}>
            {pt.nav.categories}
          </NavLink>
          <span className="nav-link nav-link-disabled" title={pt.navGroup.soon}>
            {pt.nav.favorites}
          </span>
          <span className="nav-link nav-link-disabled" title={pt.navGroup.soon}>
            {pt.nav.recent}
          </span>
        </div>

        <div className="nav-group">
          <span className="nav-group-label">{pt.navGroup.settings}</span>
          <NavLink to="/app/library" className={navClass}>
            {pt.nav.library}
          </NavLink>
          <NavLink to="/app/settings" className={navClass}>
            {pt.nav.settings}
          </NavLink>
        </div>

        <div className="sidebar-spacer" />
        </aside>

        <main className="content-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
