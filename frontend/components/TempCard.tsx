import { TempMetric } from "../lib/types";

export function TempCard({ label, value, min = 0, max = 100, warning = 50 }: TempMetric) {
  const percent = Math.min(1, Math.max(0, value / Math.abs(max - min)));
  const remainingPercent = `${Math.max(0, 1 - percent) * 100}%`;
  return (
    <article className="metric-card temp-card" aria-label={`${label} 温度`}>
      <header>
        <img src="/images/温度.png" alt="" aria-hidden />
        <span>{label}</span>
      </header>
      <div className="bar" aria-hidden>
        <div className="fill" style={{ width: remainingPercent }} />
      </div>
      <div className="value-row">
        <span className="value">{value.toFixed(1)}</span>
        <span className="unit">℃</span>
      </div>
      <div className="unit">告警阈值 {warning.toFixed(0)}℃</div>
    </article>
  );
}
