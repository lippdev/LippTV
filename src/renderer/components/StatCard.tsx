type Props = {
  label: string;
  value: string | number;
  tone?: "blue" | "amber" | "green" | "rose";
};

export function StatCard({ label, value, tone = "blue" }: Props) {
  return (
    <div className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
