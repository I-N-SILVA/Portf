"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";

export function LoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    initialError === "forbidden" ? "That account can't access this area." : "",
  );
  const [sent, setSent] = useState(false);

  const signInPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  };

  const sendMagicLink = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
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
      <h1 className="os-title" style={{ fontSize: "26px", marginBottom: "20px" }}>
        Sign in
      </h1>
      <p className="os-sub" style={{ fontSize: "13px", marginBottom: "24px" }}>
        Private workspace for active clients. Use the email attached to your project.
      </p>

      {error && <p className="os-msg err">{error}</p>}
      {sent && (
        <p className="os-msg ok">
          Check your inbox — we sent a sign-in link to {email}.
        </p>
      )}

      <form onSubmit={signInPassword}>
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
        <div className="os-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="os-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="os-btn primary os-btn-block"
          disabled={busy}
          style={{ marginTop: "4px" }}
        >
          {busy ? "…" : "Sign in →"}
        </button>
      </form>

      <button
        type="button"
        className="os-btn ghost"
        onClick={sendMagicLink}
        disabled={busy}
        style={{ marginTop: "16px" }}
      >
        Email me a sign-in link instead
      </button>

      <div className="os-auth-links">
        <Link href={routes.studio.root}>Explore services</Link>
        <Link href={routes.home}>View portfolio</Link>
      </div>
    </div>
  );
}
