"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMilestone, createProject, markMilestoneReady } from "./actions";

export function NewProjectForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button className="os-btn" onClick={() => setOpen(true)}>
        + New project
      </button>
    );
  }

  const submit = () =>
    start(async () => {
      const res = await createProject(clientId, name, description);
      if (!res.ok) {
        setError(res.error ?? "Couldn't create project.");
        return;
      }
      setName("");
      setDescription("");
      setOpen(false);
      router.refresh();
    });

  return (
    <div className="os-form">
      {error && <p className="os-msg err">{error}</p>}
      <input
        className="os-input"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="os-input"
        placeholder="Short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="os-inline-actions">
        <button className="os-btn primary" disabled={pending} onClick={submit}>
          {pending ? "…" : "Create project"}
        </button>
        <button className="os-btn ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AddMilestoneForm({
  clientId,
  projectId,
  nextPosition,
}: {
  clientId: string;
  projectId: string;
  nextPosition: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const res = await addMilestone(clientId, projectId, name, due, nextPosition);
      if (!res.ok) {
        setError(res.error ?? "Couldn't add milestone.");
        return;
      }
      setName("");
      setDue("");
      router.refresh();
    });

  return (
    <div style={{ marginTop: "12px" }}>
      {error && <p className="os-msg err">{error}</p>}
      <div className="os-form-row">
        <input
          className="os-input"
          placeholder="New milestone"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="os-input"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          style={{ flex: "0 0 auto" }}
        />
        <button
          className="os-btn"
          disabled={pending || !name.trim()}
          onClick={submit}
        >
          {pending ? "…" : "Add"}
        </button>
      </div>
    </div>
  );
}

export function MarkReadyButton({
  clientId,
  milestoneId,
}: {
  clientId: string;
  milestoneId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const res = await markMilestoneReady(clientId, milestoneId);
      if (!res.ok) {
        setError(res.error ?? "Couldn't update.");
        return;
      }
      router.refresh();
    });

  return (
    <span className="os-inline-actions">
      <button className="os-btn" disabled={pending} onClick={submit}>
        {pending ? "…" : "Mark ready for review"}
      </button>
      {error && <span className="os-msg err">{error}</span>}
    </span>
  );
}
