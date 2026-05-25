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
        setToast(msg ?? "Config saved");
      }).catch((err) => setToast(String(err)));
    }
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Settings"
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
      <Divider label="Modbus Receiver" labelPosition="left" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <TextInput
          label="Host"
          value={local.host}
          onChange={(e) => updateField("host", e.currentTarget.value)}
          placeholder="192.168.1.120"
        />
        <NumberInput
          label="Port"
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
          label="Poll Interval (ms)"
          value={local.interval}
          onChange={(v) => updateField("interval", Number(v) || 0)}
          placeholder="100"
        />
      </div>

      <Divider label="DB Settings" labelPosition="left" my={12} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <TextInput
          label="DB Driver"
          value={local.dbDriver}
          onChange={(e) => updateField("dbDriver", e.currentTarget.value)}
          placeholder="QMYSQL"
        />
        <TextInput
          label="DB Name"
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
          label="Port"
          value={local.dbPort}
          onChange={(v) => updateField("dbPort", Number(v) || 0)}
          placeholder="3306"
        />
        <TextInput
          label="User"
          value={local.dbUser}
          onChange={(e) => updateField("dbUser", e.currentTarget.value)}
          placeholder="root"
        />
        <TextInput
          label="Password"
          value={local.dbPassword}
          onChange={(e) => updateField("dbPassword", e.currentTarget.value)}
          placeholder="Password"
          type="password"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18, gap: 12 }}>
        <Button variant="outline" color="cyan" onClick={onClose}>Cancel</Button>
        <Button color="cyan" onClick={save}>Save</Button>
      </div>
    </Modal>
  );
}
