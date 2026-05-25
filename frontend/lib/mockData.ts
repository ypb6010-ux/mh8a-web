import { EnvMetric, MetricCard, SettingsForm, StatusItem, TempMetric } from "./types";

export const mockStatuses: StatusItem[] = [
  { name: "Comm", state: "blue" },
  { name: "Breaker On", state: "green" },
  { name: "Normal", state: "green" },
  { name: "Short Circuit", state: "blue" },
  { name: "Overload", state: "blue" },
  { name: "Phase Loss", state: "blue" },
  { name: "Overvoltage", state: "blue" },
  { name: "Undervoltage", state: "blue" },
  { name: "Imbalance", state: "blue" },
  { name: "Water Lockout", state: "blue" },
  { name: "Motor Temp Lockout", state: "blue" },
  { name: "Flow Lockout", state: "blue" },
  { name: "Oil Temp Lockout", state: "blue" },
  { name: "Fan Lockout", state: "blue" },
  { name: "Gas Lockout", state: "blue" },
  { name: "Leakage Lockout", state: "red" },
  { name: "Phase Seq. Protect", state: "blue" },
  { name: "Level Protect", state: "blue" },
  { name: "Voltage Phase Loss", state: "blue" },
  { name: "Phase Seq. Fault", state: "blue" },
  { name: "Oil Temp Open", state: "blue" },
  { name: "Level Open", state: "blue" },
  { name: "Motor Temp Open", state: "blue" },
  { name: "SC Lockout", state: "blue" },
  { name: "E-Stop Lockout", state: "blue" },
];

export const electricMetrics: MetricCard[] = [
  { label: "IA(A)", value: 0, unit: "A", variant: "electricity" },
  { label: "IB(A)", value: 0, unit: "A", variant: "electricity" },
  { label: "IC(A)", value: 0, unit: "A", variant: "electricity" },
  { label: "Us(V)", value: 0, unit: "V", variant: "voltage" },
  { label: "Level (m)", value: 0, unit: "m", variant: "oil" },
];

export const tempMetrics: TempMetric[] = [
  { label: "Motor Temp", value: 0, min: 0, max: 120, warning: 65 },
  { label: "Oil Temp", value: 0, min: 0, max: 120, warning: 80 },
];

export const envMetrics: EnvMetric[] = [
  { name: "Gas", value: 0, unit: "%", fixed: 1 },
  { name: "Flow", value: 0, unit: "L/min", fixed: 1 },
  { name: "Rated V", value: 0, unit: "V", fixed: 0 },
  { name: "Rated A", value: 0, unit: "A", fixed: 0 },
  { name: "RJ", value: 0, unit: "Ω", fixed: 2 },
  { name: "SC Mult.", value: 0, unit: "x", fixed: 0 },
  { name: "Methane", value: 0, unit: "%", fixed: 2 },
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
