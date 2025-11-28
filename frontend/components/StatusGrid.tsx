import { StatusItem } from "../lib/types";

interface Props {
  items: StatusItem[];
}

export function StatusGrid({ items }: Props) {
  const stateBg = (state: StatusItem["state"]) => {
    if (state === "red") return "/images/运行状态-告警.png";
    if (state === "blue") return "/images/运行状态-正常.png";
    return "/images/运行状态-执行中.png";
  };

  return (
    <section className="status-grid" aria-label="状态指示">
      {items.map((item) => (
        <div
          key={item.name}
          className="status-chip"
          style={{ backgroundImage: `url(${stateBg(item.state)})` }}
        >
          <span>{item.name}</span>
        </div>
      ))}
    </section>
  );
}
