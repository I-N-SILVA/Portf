"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRule, deleteRule, runNudgesNow, toggleRule } from "./actions";
import type { NudgeChannel, NudgeConditionType } from "@/lib/supabase/types";

const CONDITIONS: { value: NudgeConditionType; label: string; unit: string }[] = [
  { value: "no_login_days", label: "No login in N days", unit: "days" },
  { value: "milestone_awaiting_hours", label: "Milestone awaiting approval > N hours", unit: "hours" },
  { value: "invoice_unpaid_days", label: "Invoice unpaid > N days", unit: "days" },
  { value: "booking_unconfirmed_hours", label: "Booking unconfirmed within N hours (alerts admin)", unit: "hours" },
];

const CHANNELS: { value: NudgeChannel; label: string }[] = [
  { value: "in_app", label: "In-app" },
  { value: "email", label: "Email" },
  { value: "both", label: "Both" },
];

export function RunNowButton() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  return (
    <span className="os-inline-actions">
      <button
        className="os-btn primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setMsg("");
            const res = await runNudgesNow();
            if (!res.ok) return setMsg(res.error ?? "Failed.");
            setMsg(`Sent ${res.summary?.nudgesSent ?? 0} nudge(s).`);
            router.refresh();
          })
        }
      >
        {pending ? "Running…" : "Run evaluation now"}
      </button>
      {msg && <span className="os-msg ok" style={{ margin: 0 }}>{msg}</span>}
    </span>
  );
}

export function NewRuleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [conditionType, setConditionType] = useState<NudgeConditionType>("no_login_days");
  const [threshold, setThreshold] = useState("7");
  const [channel, setChannel] = useState<NudgeChannel>("both");
  const [template, setTemplate] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const unit = CONDITIONS.find((c) => c.value === conditionType)?.unit ?? "days";

  if (!open) {
    return (
      <button className="os-btn" onClick={() => setOpen(true)}>
        + New rule
      </button>
    );
  }

  const submit = () =>
    start(async () => {
      setError("");
      const res = await createRule({
        name,
        conditionType,
        threshold: parseInt(threshold, 10),
        channel,
        template,
      });
      if (!res.ok) return setError(res.error ?? "Couldn't create rule.");
      setName("");
      setTemplate("");
      setOpen(false);
      router.refresh();
    });

  return (
    <div className="os-form">
      {error && <p className="os-msg err">{error}</p>}
      <input
        className="os-input"
        placeholder="Rule name (e.g. Dormant client)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select
        className="os-input"
        value={conditionType}
        onChange={(e) => setConditionType(e.target.value as NudgeConditionType)}
      >
        {CONDITIONS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <div className="os-form-row">
        <input
          className="os-input"
          type="number"
          min="0"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          style={{ maxWidth: "120px", flex: "0 0 auto" }}
        />
        <span style={{ alignSelf: "center", color: "var(--os-muted)", fontSize: "12px" }}>
          {unit}
        </span>
        <select
          className="os-input"
          value={channel}
          onChange={(e) => setChannel(e.target.value as NudgeChannel)}
          style={{ flex: "0 0 auto" }}
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="os-input"
        rows={2}
        placeholder="Message template — use {{name}} (optional; a sensible default is used)"
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        style={{ resize: "vertical", fontFamily: "var(--os-sans)" }}
      />
      <div className="os-inline-actions">
        <button className="os-btn primary" disabled={pending} onClick={submit}>
          {pending ? "…" : "Create rule"}
        </button>
        <button className="os-btn ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function RuleControls({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <span className="os-inline-actions">
      <button
        className="os-btn"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleRule(id, !active);
            router.refresh();
          })
        }
      >
        {active ? "Disable" : "Enable"}
      </button>
      <button
        className="os-btn ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await deleteRule(id);
            router.refresh();
          })
        }
      >
        Delete
      </button>
    </span>
  );
}
