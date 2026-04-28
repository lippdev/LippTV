import { NavLink } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import {
  FolderIcon,
  GearIcon,
  HomeIcon,
  MoonIcon,
  PlaylistsIcon,
  SunIcon,
  TvIcon,
  VideoCollectionIcon
} from "./icons";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";

type SidebarMode = "welcome" | "app";
type SidebarCurrent = "welcome" | "live" | "movies" | "series" | "library" | "settings";

type AppSidebarProps = {
  mode: SidebarMode;
  current: SidebarCurrent;
};

export function AppSidebar({ mode, current }: AppSidebarProps) {
  const theme = useAppStore((state) => state.snapshot.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const libraries = useAppStore((state) => state.snapshot.libraries);
  const currentPlaylistLabel =
    libraries.length === 0 ? pt.welcome.sidebarEmpty : `${libraries.length} ${pt.welcome.sidebarSources}`;

  const navClass = ({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar sidebar-windows">
      <div className="sidebar-top">
        <div className="brand brand-compact">
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

      <div className="sidebar-section">
        <span className="sidebar-section-label">
          {mode === "welcome" ? pt.welcome.sidebarSection : pt.navGroup.navigation}
        </span>
        {mode === "welcome" ? (
          <button type="button" className="nav-link active nav-link-static" aria-current="page">
            <PlaylistsIcon />
            <span>{pt.welcome.sidebarPlaylists}</span>
          </button>
        ) : (
          <>
            <NavLink to="/app/live" className={navClass} end>
              <TvIcon />
              <span>{pt.nav.live}</span>
            </NavLink>
            <NavLink to="/app/movies" className={navClass}>
              <VideoCollectionIcon />
              <span>{pt.nav.movies}</span>
            </NavLink>
            <NavLink to="/app/series" className={navClass}>
              <FolderIcon />
              <span>{pt.nav.series}</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-spacer" />

      <div className="sidebar-section">
        <NavLink to="/" className="nav-link" end>
          <HomeIcon />
          <span>Voltar ao menu</span>
        </NavLink>
      </div>
    </aside>
  );
}
