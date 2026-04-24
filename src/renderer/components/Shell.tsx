import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TitleBar } from "./TitleBar";

export function Shell() {
  const location = useLocation();
  const current =
    location.pathname.includes("/movies")
      ? "movies"
      : location.pathname.includes("/series")
        ? "series"
        : location.pathname.includes("/library")
          ? "library"
          : location.pathname.includes("/settings")
            ? "settings"
            : "live";

  return (
    <div className="desktop-shell">
      <TitleBar />
      <div className="app-shell">
        <AppSidebar mode="app" current={current} />

        <main className="content-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
