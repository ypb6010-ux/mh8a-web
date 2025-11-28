export type StatusState = "green" | "blue" | "red";

export interface StatusItem {
  name: string;
  state: StatusState;
}

export interface MetricCard {
  label: string;
  value: number;
  unit?: string;
  variant?: "electricity" | "voltage" | "oil";
}

export interface TempMetric {
  label: string;
  value: number;
  min?: number;
  max?: number;
  warning?: number;
}

export interface EnvMetric {
  name: string;
  value: number;
  unit?: string;
  fixed?: number;
}

export interface SettingsForm {
  host: string;
  port: number;
  slaveID: number;
  interval: number;
  dbDriver: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbDatabase: string;
}
