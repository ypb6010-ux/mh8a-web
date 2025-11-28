import { EnvMetric, MetricCard, SettingsForm, StatusItem, TempMetric } from "./types";

export const mockStatuses: StatusItem[] = [
  { name: "通讯状态", state: "blue" },
  { name: "合闸", state: "green" },
  { name: "运行正常", state: "green" },
  { name: "短路保护", state: "blue" },
  { name: "过载保护", state: "blue" },
  { name: "断相保护", state: "blue" },
  { name: "过压保护", state: "blue" },
  { name: "欠压保护", state: "blue" },
  { name: "不平衡", state: "blue" },
  { name: "水压闭锁", state: "blue" },
  { name: "机温闭锁", state: "blue" },
  { name: "流量闭锁", state: "blue" },
  { name: "油温闭锁", state: "blue" },
  { name: "风电闭锁", state: "blue" },
  { name: "瓦斯闭锁", state: "blue" },
  { name: "漏电闭锁", state: "red" },
  { name: "相序保护", state: "blue" },
  { name: "液位保护", state: "blue" },
  { name: "电压缺相", state: "blue" },
  { name: "相序故障", state: "blue" },
  { name: "油温断线", state: "blue" },
  { name: "液位断线", state: "blue" },
  { name: "机温断线", state: "blue" },
  { name: "短路闭锁", state: "blue" },
  { name: "急停闭锁", state: "blue" },
];

export const electricMetrics: MetricCard[] = [
  { label: "IA(A)", value: 0, unit: "A", variant: "electricity" },
  { label: "IB(A)", value: 0, unit: "A", variant: "electricity" },
  { label: "IC(A)", value: 0, unit: "A", variant: "electricity" },
  { label: "Us(V)", value: 0, unit: "V", variant: "voltage" },
  { label: "液位(M)", value: 0, unit: "M", variant: "oil" },
];

export const tempMetrics: TempMetric[] = [
  { label: "机温", value: 0, min: 0, max: 120, warning: 65 },
  { label: "油温", value: 0, min: 0, max: 120, warning: 80 },
];

export const envMetrics: EnvMetric[] = [
  { name: "瓦斯浓度", value: 0, unit: "%", fixed: 1 },
  { name: "流量", value: 0, unit: "L/min", fixed: 1 },
  { name: "额定电压", value: 0, unit: "V", fixed: 0 },
  { name: "额定电流", value: 0, unit: "A", fixed: 0 },
  { name: "rj", value: 0, unit: "Ω", fixed: 2 },
  { name: "短路倍数", value: 0, unit: "x", fixed: 0 },
  { name: "甲烷", value: 0, unit: "%", fixed: 2 },
];

export const defaultSettings: SettingsForm = {
  host: "192.168.1.120",
  port: 502,
  slaveID: 1,
  interval: 100,
  dbDriver: "QMYSQL",
  dbHost: "localhost",
  dbPort: 3306,
  dbUser: "root",
  dbPassword: "ylkj123",
  dbDatabase: "ylkj",
};

export function nextMockTick(base: SettingsForm) {
  const jitter = () => (Math.random() * 2 - 1) * 0.8;
  const nextElectric = electricMetrics.map((m) => ({ ...m, value: Math.max(0, m.value + jitter()) }));
  const nextTemp = tempMetrics.map((t) => ({ ...t, value: Math.max(0, Math.min(t.max ?? 100, 50 + t.value + jitter())) }));
  const nextEnv = envMetrics.map((e) => ({ ...e, value: Math.max(0, e.value + jitter() / 5) }));
  return { nextElectric, nextTemp, nextEnv, settings: base };
}
