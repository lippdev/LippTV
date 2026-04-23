import { ImportPanel } from "../components/ImportPanel";
import { StatCard } from "../components/StatCard";
import { pt } from "../i18n/pt";
import { selectOverview, useAppStore } from "../stores/appStore";

export function DashboardPage() {
  const snapshot = useAppStore((state) => state.snapshot);
  const overview = selectOverview(snapshot);

  return (
    <div className="page">
      <section className="hero hero-compact">
        <div>
          <span className="eyebrow">{pt.dashboard.eyebrow}</span>
          <h1>{pt.dashboard.title}</h1>
          <p>{pt.dashboard.subtitle}</p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label={pt.dashboard.statsSources} value={overview.totalSources} />
        <StatCard label={pt.dashboard.statsItems} value={overview.totalItems} tone="green" />
        <StatCard label={pt.dashboard.statsLive} value={overview.liveChannels} tone="amber" />
        <StatCard
          label={pt.dashboard.statsVod}
          value={overview.movies + overview.series}
          tone="rose"
        />
      </section>

      <ImportPanel />
    </div>
  );
}
