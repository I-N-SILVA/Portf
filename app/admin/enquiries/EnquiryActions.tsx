"use client";

import { useState, useTransition } from "react";
import { markHandled } from "./actions";

export function MarkHandledButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        className="os-btn"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await markHandled(id);
            setError(res.ok ? null : (res.error ?? "Could not update that."));
          })
        }
      >
        {pending ? "Marking…" : "Mark handled"}
      </button>
      {error && (
        <span role="alert" className="os-error">
          {error}
        </span>
      )}
    </>
  );
}
