"use client";

import { useEffect, useMemo, useState } from "react";
import { EnvCard } from "../components/EnvCard";
import { HeroPanel } from "../components/HeroPanel";
import { MonitorCard } from "../components/MonitorCard";
import { SettingsModal } from "../components/SettingsModal";
import { StatusGrid } from "../components/StatusGrid";
import { TempCard } from "../components/TempCard";
import { defaultSettings, electricMetrics, envMetrics, mockStatuses, tempMetrics } from "../lib/mockData";
import { SettingsForm } from "../lib/types";

export default function Page() {
  const [timeText, setTimeText] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [statuses, setStatuses] = useState(
    () =>
      mockStatuses.map((s) => {
        if (s.name === "通讯状态" || s.name === "运行正常") return { ...s, state: "blue" };
        return { ...s, state: s.state === "red" ? "blue" : s.state };
      })
  );
  const [electric, setElectric] = useState(electricMetrics);
  const [temps, setTemps] = useState(tempMetrics);
  const [envs, setEnvs] = useState(envMetrics);
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusTimer, setStatusTimer] = useState<NodeJS.Timeout | null>(null);
  const [wsStatus, setWsStatus] = useState<"connected" | "disconnected" | "error" | "retrying">("disconnected");
  const [wsNotice, setWsNotice] = useState<string>("实时通道未连接");
  const [wsVisible, setWsVisible] = useState<boolean>(true);
  const [wsTimer, setWsTimer] = useState<NodeJS.Timeout | null>(null);
  const apiBase = "/api/modbus";

  useEffect(() => {
    setMounted(true);
    setTimeText(new Date());
    const timer = setInterval(() => setTimeText(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLabel = useMemo(
    () => (timeText ? timeText.toLocaleTimeString("zh-CN", { hour12: false }) : "--:--:--"),
    [timeText]
  );
  const dateLabel = useMemo(
    () => (timeText ? timeText.toISOString().slice(0, 10) : "----/--/--"),
    [timeText]
  );

  const handleSaveSettings = async (payload: SettingsForm) => {
    setSettings(payload);
    const res = await fetch(`${apiBase}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: payload.host,
        port: payload.port,
        slaveId: payload.slaveID,
        intervalMs: payload.interval,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      setStatusMessage("配置保存失败");
      throw new Error(text || "保存失败");
    }
    setStatusMessage("配置已更新");
    setShowSettings(false);
    if (statusTimer) clearTimeout(statusTimer);
    setStatusTimer(setTimeout(() => setStatusMessage(""), 3000));
    return "配置已保存";
  };

  const applyTelemetry = (snap: any) => {
    const num = (v: any) => (typeof v === "number" ? v : Number(v) || 0);
    const faultCode = snap.faultCode ?? snap.faultcode ?? 0;
    const connected = Boolean(snap.connected ?? false);
    const zero = (v: number) => (connected ? v : 0);
    setElectric([
      { label: "IA(A)", value: zero(num(snap.ia)), unit: "A", variant: "electricity" },
      { label: "IB(A)", value: zero(num(snap.ib)), unit: "A", variant: "electricity" },
      { label: "IC(A)", value: zero(num(snap.ic)), unit: "A", variant: "electricity" },
      { label: "Us(V)", value: zero(num(snap.us)), unit: "V", variant: "voltage" },
      { label: "液位(M)", value: zero(num(snap.level)), unit: "M", variant: "oil" },
    ]);
    setTemps([
      { label: "机温", value: zero(num(snap.tempMachine)), min: 0, max: 200, warning: 65 },
      { label: "油温", value: zero(num(snap.tempOil)), min: 0, max: 300, warning: 80 },
    ]);
    setEnvs([
      { name: "瓦斯浓度", value: zero(num(snap.gas)), unit: "%", fixed: 1 },
      { name: "流量", value: zero(num(snap.flow)), unit: "L/min", fixed: 1 },
      { name: "额定电压", value: zero(num(snap.ratedVoltage)), unit: "V", fixed: 0 },
      { name: "额定电流", value: zero(num(snap.ratedCurrent)), unit: "A", fixed: 0 },
      { name: "rj", value: zero(num(snap.rj)), unit: "Ω", fixed: 2 },
      { name: "短路倍数", value: zero(num(snap.shortCircuitFactor)), unit: "x", fixed: 0 },
      { name: "甲烷", value: zero(num(snap.methane)), unit: "%", fixed: 2 },
    ]);

    const faultNameMap: Record<number, string> = {
      1: "短路保护",
      2: "过载保护",
      3: "断相保护",
      4: "过压保护",
      5: "欠压保护",
      6: "不平衡",
      7: "水压闭锁",
      8: "机温闭锁",
      9: "流量闭锁",
      10: "油温闭锁",
      11: "风电闭锁",
      12: "瓦斯闭锁",
      13: "漏电闭锁",
      14: "相序保护",
      15: "液位保护",
      16: "电压缺相",
      17: "相序故障",
      18: "油温断线",
      19: "液位断线",
      20: "机温断线",
      21: "短路闭锁",
      22: "急停闭锁",
    };
    const activeFault = faultNameMap[faultCode] ?? null;

    setStatuses(
      mockStatuses.map((s) => {
        if (s.name === "通讯状态") return { ...s, state: connected ? "green" : "blue" }; // 无信号为蓝
        if (s.name === "运行正常") return { ...s, state: connected && faultCode === 0 ? "green" : "blue" };
        if (s.name === "合闸") return { ...s, state: connected && snap.breakerClosed ? "green" : "blue" };
        if (!connected) return { ...s, state: "blue" };
        if (activeFault && s.name === activeFault) return { ...s, state: "red" };
        return { ...s, state: s.state === "red" ? "blue" : s.state };
      })
    );
  };

  useEffect(() => {
    fetch(`${apiBase}/telemetry`)
      .then((res) => res.json())
      .then(applyTelemetry)
      .catch((err) => console.warn("Failed to load initial telemetry", err));
    fetch(`${apiBase}/config`)
      .then((res) => res.json())
      .then((cfg) => {
        const incoming: SettingsForm = {
          host: cfg.host ?? settings.host,
          port: cfg.port ?? settings.port,
          slaveID: cfg.slaveId ?? cfg.slaveID ?? settings.slaveID,
          interval: cfg.intervalMs ?? cfg.interval ?? settings.interval,
          dbDriver: settings.dbDriver,
          dbHost: settings.dbHost,
          dbPort: settings.dbPort,
          dbUser: settings.dbUser,
          dbPassword: settings.dbPassword,
          dbDatabase: settings.dbDatabase,
        };
        setSettings(incoming);
      })
      .catch((err) => console.warn("Failed to load config", err));
  }, [apiBase]);

  useEffect(() => {
    const wsUrl =
      typeof window !== "undefined"
        ? window.location.origin.replace(/^http/, "ws") + "/ws/telemetry"
        : "/ws/telemetry";
    let ws: WebSocket | null = null;
    let retryTimer: any = null;
    const resetAll = () => {
      applyTelemetry({ connected: false });
      setWsStatus("disconnected");
      setWsNotice("实时通道断开，等待重连...");
      setWsVisible(true);
    };
    const connect = () => {
      setWsStatus("retrying");
      setWsNotice("正在连接实时通道...");
      setWsVisible(true);
      if (wsTimer) clearTimeout(wsTimer);
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        console.info("WebSocket connected");
        if (retryTimer) {
          clearTimeout(retryTimer);
          retryTimer = null;
        }
        setWsStatus("connected");
        setWsNotice("实时通道已连接");
        const t = setTimeout(() => setWsVisible(false), 3000);
        setWsTimer(t);
      };
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          applyTelemetry(data);
        } catch (e) {
          console.error("Invalid telemetry payload", e);
        }
      };
      const scheduleReconnect = () => {
        if (retryTimer) return;
        retryTimer = setTimeout(() => {
          retryTimer = null;
          connect();
        }, 2000);
        resetAll();
      };
      ws.onerror = (err) => {
        console.warn("WebSocket error", err);
        setWsStatus("error");
        setWsNotice("实时通道异常，准备重连...");
        setWsVisible(true);
        scheduleReconnect();
      };
      ws.onclose = () => {
        console.warn("WebSocket closed");
        setWsNotice("实时通道断开，准备重连...");
        setWsVisible(true);
        scheduleReconnect();
      };
    };
    connect();
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (ws) ws.close();
    };
  }, [apiBase]);

  return (
    <main>
      <header className="top-bar">
        <div className="brand">
          <div style={{ width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center" }}>
            <img src="/images/LOGO.png"></img>
          </div>
          <h1>锚杆钻机智能系统</h1>
        </div>
        <div className="actions">
          {statusMessage && <div className="badge">{statusMessage}</div>}
          <div className="time-box">
            <div className="time-block">
              <div className="time-text">{timeLabel}</div>
              <div className="date-text">{dateLabel}</div>
            </div>
          </div>
          <button className="button" onClick={() => setShowSettings(true)}>设置</button>
          <button className="button secondary" onClick={() => alert("退出应用（模拟）")}>退出</button>
        </div>
      </header>

      <section className="status-ribbon">
        <StatusGrid items={statuses} />
      </section>

      <div className="content-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
          <section className="panel" style={{ flex: 0.65 }}>
            <div className="panel-header">电压电流</div>
            <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(3, minmax(120px, 1fr))" }}>
              {electric.map((m) => (
                <MonitorCard key={m.label} {...m} />
              ))}
            </div>
          </section>

          <section className="panel" style={{ flex: 0.35 }}>
            <div className="panel-header">温度信息</div>
            <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(2, minmax(120px, 1fr))" }}>
              {temps.map((t) => (
                <TempCard key={t.label} {...t} />
              ))}
            </div>
          </section>
        </div>

        <div style={{ height: "100%", width: "100%" }}>
          <HeroPanel />
        </div>

        <section className="panel" style={{ height: "100%", justifySelf: "end", width: "100%" }}>
          <div className="panel-header">环境信息</div>
          <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(3, minmax(140px, 1fr))" }}>
            {envs.map((e) => (
              <EnvCard key={e.name} {...e} />
            ))}
          </div>
        </section>
      </div>

      <SettingsModal open={showSettings} form={settings} onClose={() => setShowSettings(false)} onSave={handleSaveSettings} />
      {wsVisible && (
        <div className={`ws-toast ${wsStatus}`}>
          {wsNotice}
        </div>
      )}
    </main>
  );
}
