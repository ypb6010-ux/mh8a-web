"use client";

import { useEffect, useState } from "react";
import { SettingsForm } from "../lib/types";
import { Modal, TextInput, NumberInput, Divider, Button } from "@mantine/core";

interface Props {
  open: boolean;
  form: SettingsForm;
  onClose: () => void;
  onSave: (form: SettingsForm) => Promise<string | null> | void;
}

export function SettingsModal({ open, form, onClose, onSave }: Props) {
  const [local, setLocal] = useState<SettingsForm>(form);
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    setLocal(form);
  }, [form]);

  const updateField = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    const maybe = onSave(local);
    if (maybe instanceof Promise) {
      maybe.then((msg) => {
        setToast(msg ?? "配置已保存");
      }).catch((err) => setToast(String(err)));
    }
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="系统设置"
      centered
      size="lg"
      className="dark-modal"
      styles={{
        content: {
          background: "rgba(15, 31, 51, 0.95)",
          border: "1px solid var(--border)",
        },
        header: {
          background: "rgba(15, 31, 51, 0.95)",
          borderBottom: "1px solid var(--border)",
          color: "var(--text-main)",
        },
        body: {
          background: "rgba(15, 31, 51, 0.95)",
          color: "var(--text-main)",
          maxHeight: "70vh",
          overflow: "auto",
        },
      }}
    >
      {toast && <div className="badge" style={{ marginBottom: 12 }}>{toast}</div>}
      <Divider label="Modbus 接收器" labelPosition="left" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <TextInput
          label="地址"
          value={local.host}
          onChange={(e) => updateField("host", e.currentTarget.value)}
          placeholder="192.168.1.120"
        />
        <NumberInput
          label="端口"
          value={local.port}
          onChange={(v) => updateField("port", Number(v) || 0)}
          placeholder="502"
        />
        <NumberInput
          label="Slave ID"
          value={local.slaveID}
          onChange={(v) => updateField("slaveID", Number(v) || 0)}
          placeholder="1"
        />
        <NumberInput
          label="扫描周期(ms)"
          value={local.interval}
          onChange={(v) => updateField("interval", Number(v) || 0)}
          placeholder="100"
        />
      </div>

      <Divider label="数据库配置" labelPosition="left" my={12} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <TextInput
          label="数据库驱动"
          value={local.dbDriver}
          onChange={(e) => updateField("dbDriver", e.currentTarget.value)}
          placeholder="QMYSQL"
        />
        <TextInput
          label="数据库名称"
          value={local.dbDatabase}
          onChange={(e) => updateField("dbDatabase", e.currentTarget.value)}
          placeholder="ylkj"
        />
        <TextInput
          label="IP"
          value={local.dbHost}
          onChange={(e) => updateField("dbHost", e.currentTarget.value)}
          placeholder="localhost"
        />
        <NumberInput
          label="端口"
          value={local.dbPort}
          onChange={(v) => updateField("dbPort", Number(v) || 0)}
          placeholder="3306"
        />
        <TextInput
          label="用户"
          value={local.dbUser}
          onChange={(e) => updateField("dbUser", e.currentTarget.value)}
          placeholder="root"
        />
        <TextInput
          label="密码"
          value={local.dbPassword}
          onChange={(e) => updateField("dbPassword", e.currentTarget.value)}
          placeholder="密码"
          type="password"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18, gap: 12 }}>
        <Button variant="outline" color="cyan" onClick={onClose}>取消</Button>
        <Button color="cyan" onClick={save}>保存</Button>
      </div>
    </Modal>
  );
}
