"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";

export function SetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace(routes.portal);
    router.refresh();
  };

  return (
    <div className="os-auth-box">
      <p className="os-eyebrow">Welcome</p>
      <h1 className="os-title" style={{ fontSize: "26px", marginBottom: "8px" }}>
        Set your password
      </h1>
      <p className="os-sub" style={{ marginBottom: "24px" }}>
        Choose a password to finish setting up your account.
      </p>

      {error && <p className="os-msg err">{error}</p>}

      <form onSubmit={submit}>
        <div className="os-field">
          <label htmlFor="pw">New password</label>
          <input
            id="pw"
            type="password"
            className="os-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="os-field">
          <label htmlFor="pw2">Confirm password</label>
          <input
            id="pw2"
            type="password"
            className="os-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <button
          type="submit"
          className="os-btn primary os-btn-block"
          disabled={busy}
          style={{ marginTop: "4px" }}
        >
          {busy ? "…" : "Set password →"}
        </button>
      </form>
    </div>
  );
}
