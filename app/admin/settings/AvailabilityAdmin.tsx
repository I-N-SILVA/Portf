"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAvailability, removeAvailability } from "./actions";
import { WEEKDAYS } from "@/lib/os/booking-utils";

export function AddAvailabilityForm() {
  const router = useRouter();
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setError("");
      const res = await addAvailability(weekday, startTime, endTime);
      if (!res.ok) return setError(res.error ?? "Couldn't add window.");
      router.refresh();
    });

  return (
    <div className="os-form">
      {error && <p className="os-msg err">{error}</p>}
      <div className="os-form-row">
        <select
          className="os-input"
          value={weekday}
          onChange={(e) => setWeekday(Number(e.target.value))}
        >
          {WEEKDAYS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
        <input
          className="os-input"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{ flex: "0 0 auto" }}
        />
        <input
          className="os-input"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={{ flex: "0 0 auto" }}
        />
        <button className="os-btn" disabled={pending} onClick={submit}>
          {pending ? "…" : "Add window"}
        </button>
      </div>
    </div>
  );
}

export function RemoveAvailabilityButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="os-btn ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await removeAvailability(id);
          router.refresh();
        })
      }
    >
      Remove
    </button>
  );
}
