"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmBooking, declineBooking } from "./actions";

export function BookingDecision({
  clientId,
  bookingId,
}: {
  clientId: string;
  bookingId: string;
}) {
  const router = useRouter();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const confirm = () =>
    start(async () => {
      const res = await confirmBooking(clientId, bookingId);
      if (!res.ok) return setError(res.error ?? "Couldn't confirm.");
      router.refresh();
    });

  const decline = () =>
    start(async () => {
      const res = await declineBooking(clientId, bookingId, reason);
      if (!res.ok) return setError(res.error ?? "Couldn't decline.");
      setDeclining(false);
      router.refresh();
    });

  if (declining) {
    return (
      <div style={{ marginTop: "10px" }}>
        {error && <p className="os-msg err">{error}</p>}
        <div className="os-form-row">
          <input
            className="os-input"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button className="os-btn primary" disabled={pending} onClick={decline}>
            {pending ? "…" : "Decline"}
          </button>
          <button className="os-btn ghost" onClick={() => setDeclining(false)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="os-inline-actions" style={{ marginTop: "10px" }}>
      <button className="os-btn primary" disabled={pending} onClick={confirm}>
        {pending ? "…" : "Confirm"}
      </button>
      <button className="os-btn" disabled={pending} onClick={() => setDeclining(true)}>
        Decline
      </button>
      {error && <span className="os-msg err">{error}</span>}
    </span>
  );
}
