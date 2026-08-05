"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking, requestBooking, rescheduleBooking } from "./actions";

const SERVICE_TYPES = ["Strategy call", "Check-in", "Working session", "Other"];
const DURATIONS = [
  { label: "30 min", min: 30 },
  { label: "45 min", min: 45 },
  { label: "60 min", min: 60 },
  { label: "90 min", min: 90 },
];

function addMinutes(local: string, minutes: number): string {
  return new Date(new Date(local).getTime() + minutes * 60000).toISOString();
}

export function RequestBookingForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      setError("");
      setOk(false);
      const res = await requestBooking(
        slug,
        serviceType,
        new Date(start).toISOString(),
        addMinutes(start, duration),
        notes,
      );
      if (!res.ok) {
        setError(res.error ?? "Couldn't request that time.");
        return;
      }
      setOk(true);
      setStart("");
      setNotes("");
      router.refresh();
    });

  return (
    <div className="os-form">
      {error && <p className="os-msg err">{error}</p>}
      {ok && <p className="os-msg ok">Requested — we&apos;ll confirm shortly.</p>}
      <div className="os-form-row">
        <select
          className="os-input"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        >
          {SERVICE_TYPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="os-input"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          style={{ flex: "0 0 auto", maxWidth: "140px" }}
        >
          {DURATIONS.map((d) => (
            <option key={d.min} value={d.min}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <input
        className="os-input"
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        className="os-input"
        placeholder="Anything we should know? (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        className="os-btn primary"
        disabled={pending || !start}
        onClick={submit}
        style={{ alignSelf: "flex-start" }}
      >
        {pending ? "…" : "Request session →"}
      </button>
    </div>
  );
}

export function BookingActions({
  slug,
  bookingId,
  durationMin,
}: {
  slug: string;
  bookingId: string;
  durationMin: number;
}) {
  const router = useRouter();
  const [rescheduling, setRescheduling] = useState(false);
  const [start, setStart] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const doCancel = () =>
    startTransition(async () => {
      const res = await cancelBooking(slug, bookingId);
      if (!res.ok) return setError(res.error ?? "Couldn't cancel.");
      router.refresh();
    });

  const doReschedule = () =>
    startTransition(async () => {
      const res = await rescheduleBooking(
        slug,
        bookingId,
        new Date(start).toISOString(),
        addMinutes(start, durationMin),
      );
      if (!res.ok) return setError(res.error ?? "Couldn't reschedule.");
      setRescheduling(false);
      router.refresh();
    });

  if (rescheduling) {
    return (
      <div style={{ marginTop: "10px" }}>
        {error && <p className="os-msg err">{error}</p>}
        <div className="os-form-row">
          <input
            className="os-input"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <button
            className="os-btn primary"
            disabled={pending || !start}
            onClick={doReschedule}
          >
            {pending ? "…" : "Confirm new time"}
          </button>
          <button className="os-btn ghost" onClick={() => setRescheduling(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="os-inline-actions" style={{ marginTop: "10px" }}>
      <button className="os-btn" disabled={pending} onClick={() => setRescheduling(true)}>
        Reschedule
      </button>
      <button className="os-btn ghost" disabled={pending} onClick={doCancel}>
        Cancel
      </button>
      {error && <span className="os-msg err">{error}</span>}
    </span>
  );
}
