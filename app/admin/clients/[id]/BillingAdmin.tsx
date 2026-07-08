"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "./actions";

export function CreateInvoiceForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDays, setDueDays] = useState("7");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button className="os-btn" onClick={() => setOpen(true)}>
        + New invoice
      </button>
    );
  }

  const submit = () =>
    start(async () => {
      const res = await createInvoice(
        clientId,
        parseFloat(amount),
        description,
        parseInt(dueDays, 10),
      );
      if (!res.ok) {
        setError(res.error ?? "Couldn't create invoice.");
        return;
      }
      setAmount("");
      setDescription("");
      setOpen(false);
      router.refresh();
    });

  return (
    <div className="os-form">
      {error && <p className="os-msg err">{error}</p>}
      <input
        className="os-input"
        placeholder="Description (e.g. Homepage build — final)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="os-form-row">
        <input
          className="os-input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount (£)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="os-input"
          type="number"
          min="1"
          placeholder="Due in (days)"
          value={dueDays}
          onChange={(e) => setDueDays(e.target.value)}
          style={{ flex: "0 0 auto", maxWidth: "140px" }}
        />
      </div>
      <div className="os-inline-actions">
        <button className="os-btn primary" disabled={pending} onClick={submit}>
          {pending ? "…" : "Create & send"}
        </button>
        <button className="os-btn ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
