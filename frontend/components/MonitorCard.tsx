import { MetricCard } from "../lib/types";

export function MonitorCard({ label, value, unit, variant = "electricity" }: MetricCard) {
  const iconSrc =
    variant === "voltage"
      ? "/images/电压.png"
      : variant === "oil"
        ? "/images/油箱油位.png"
        : "/images/电流.png";
  return (
    <article className={`metric-card monitor-card ${variant}`} aria-label={label}>
      <header>{label}</header>
      <div className="frame">
        <img className="icon" src={iconSrc} alt={label} />
        <div className="value">
          {value.toFixed(variant === "oil" ? 1 : 0)}
          {unit && <span className="unit">{unit}</span>}
        </div>
      </div>
    </article>
  );
}
