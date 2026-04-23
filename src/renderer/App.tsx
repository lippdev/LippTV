import { Navigate, Route, Routes } from "react-router-dom";
import { RequireLibraries } from "./components/AppShell";
import { Shell } from "./components/Shell";
import { useBoot } from "./hooks/useBoot";
import { CatalogPage } from "./pages/CatalogPage";
import { LibraryPage } from "./pages/LibraryPage";
import { LiveTvPage } from "./pages/LiveTvPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WelcomePage } from "./pages/WelcomePage";

export function App() {
  useBoot();

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />

      <Route path="/app" element={<RequireLibraries />}>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="live" replace />} />
          <Route path="live" element={<LiveTvPage />} />
          <Route path="movies" element={<CatalogPage mode="movie" />} />
          <Route path="series" element={<CatalogPage mode="series" />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
