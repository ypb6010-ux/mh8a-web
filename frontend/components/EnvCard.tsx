import { EnvMetric } from "../lib/types";

export function EnvCard({ name, value, unit = "%", fixed = 1 }: EnvMetric) {
  return (
    <article className="metric-card env-card" aria-label={name}>
      <div className="name">{name}</div>
      <div className="value-row">
        <span className="value">{value.toFixed(fixed)}</span>
        <span className="unit">{unit}</span>
      </div>
    </article>
  );
}
