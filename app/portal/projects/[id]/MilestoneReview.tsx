"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { respondToMilestone } from "../actions";

const GLYPHS = "▚▞▙▟▛▜◤◢#@%&$*";

/**
 * The signature "decipher & sign" interaction. Approving scrambles the button
 * label until it resolves to "Signed", then commits. Requesting changes opens
 * a comment field first.
 */
export function MilestoneReview({
  milestoneId,
  onDone,
}: {
  milestoneId: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [label, setLabel] = useState("Decipher & sign");

  const commit = async (approve: boolean) => {
    setBusy(true);
    setError("");
    const res = await respondToMilestone(milestoneId, approve, comment);
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "Something went wrong.");
      setLabel("Decipher & sign");
      return;
    }
    onDone?.();
    router.refresh();
  };

  const approve = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setLabel("Signing…");
      void commit(true);
      return;
    }
    const target = "Signed ✓";
    let frame = 0;
    const iv = setInterval(() => {
      let out = "";
      for (let i = 0; i < target.length; i++) {
        out +=
          i < frame / 2
            ? target[i]
            : GLYPHS[Math.floor((frame * 7 + i * 13) % GLYPHS.length)];
      }
      setLabel(out);
      frame++;
      if (frame / 2 >= target.length) {
        clearInterval(iv);
        setLabel(target);
        void commit(true);
      }
    }, 55);
  };

  if (mode === "rejecting") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <textarea
          className="os-input"
          rows={3}
          placeholder="What needs changing?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ resize: "vertical", fontFamily: "var(--os-sans)" }}
        />
        {error && <p className="os-msg err">{error}</p>}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="os-btn primary"
            disabled={busy || !comment.trim()}
            onClick={() => commit(false)}
          >
            {busy ? "…" : "Send request"}
          </button>
          <button
            className="os-btn ghost"
            disabled={busy}
            onClick={() => {
              setMode("idle");
              setError("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {error && <p className="os-msg err">{error}</p>}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button className="os-btn primary" disabled={busy} onClick={approve}>
          {label} →
        </button>
        <button
          className="os-btn"
          disabled={busy}
          onClick={() => setMode("rejecting")}
        >
          Request changes
        </button>
      </div>
    </div>
  );
}
