"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/set-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="os-auth-box">
      <p className="os-eyebrow">Shaft OS</p>
      <h1 className="os-title" style={{ fontSize: "26px", marginBottom: "8px" }}>
        Reset password
      </h1>
      <p className="os-sub" style={{ marginBottom: "24px" }}>
        We&apos;ll email you a link to choose a new password.
      </p>

      {error && <p className="os-msg err">{error}</p>}
      {sent ? (
        <p className="os-msg ok">
          If an account exists for {email}, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={submit}>
          <div className="os-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="os-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <button
            type="submit"
            className="os-btn primary os-btn-block"
            disabled={busy}
            style={{ marginTop: "4px" }}
          >
            {busy ? "…" : "Send reset link →"}
          </button>
        </form>
      )}
    </div>
  );
}
