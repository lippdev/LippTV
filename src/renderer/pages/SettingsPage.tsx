import { MoonIcon, SunIcon } from "../components/icons";
import { pt } from "../i18n/pt";
import { useAppStore } from "../stores/appStore";

export function SettingsPage() {
  const theme = useAppStore((state) => state.snapshot.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  return (
    <div className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{pt.settings.title}</h2>
            <p>{pt.settings.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          className="theme-toggle theme-toggle-inline"
          onClick={() => void setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          {theme === "dark" ? pt.theme.light : pt.theme.dark}
        </button>
      </section>
    </div>
  );
}
