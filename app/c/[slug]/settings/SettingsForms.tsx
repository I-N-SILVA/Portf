"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveProfile, saveEmailPreferences } from "./actions";
import {
  EMAIL_PREF_COPY,
  type EmailPreferences,
} from "@/lib/os/preference-utils";

type Msg = { kind: "ok" | "err"; text: string } | null;

/**
 * Every form here writes the *signed-in user's* own row — `auth.uid()` is what
 * the definer functions resolve, and `supabase.auth.updateUser` changes the
 * caller's own password. So when an admin is looking at a client's space,
 * these are disabled rather than hidden: a saved change would land on the
 * admin's account while appearing to edit the client's, which is worse than
 * not offering it.
 */
function ReadOnlyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="os-msg" style={{ color: "var(--os-muted)" }}>
      {children}
    </p>
  );
}

export function ProfileForm({
  fullName: initialName,
  phone: initialPhone,
  email,
  slug,
  editable,
}: {
  fullName: string;
  phone: string;
  email: string;
  slug: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const dirty = fullName !== initialName || phone !== initialPhone;

  const submit = () =>
    start(async () => {
      setMsg(null);
      const res = await saveProfile(slug, fullName, phone);
      setMsg(
        res.ok
          ? { kind: "ok", text: "Saved." }
          : { kind: "err", text: res.error ?? "Couldn't save." },
      );
      if (res.ok) router.refresh();
    });

  return (
    <div className="os-form">
      {msg && <p className={`os-msg ${msg.kind}`}>{msg.text}</p>}
      {!editable && (
        <ReadOnlyNote>
          You&apos;re signed in as an admin — this form writes your own
          account, so it&apos;s disabled here. Edit the client record from the
          console instead.
        </ReadOnlyNote>
      )}

      <div className="os-field">
        <label htmlFor="full-name">Your name</label>
        <input
          id="full-name"
          className="os-input"
          value={fullName}
          disabled={!editable}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="How we should address you"
        />
      </div>

      <div className="os-field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          className="os-input"
          type="tel"
          value={phone}
          disabled={!editable}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div className="os-field">
        <label htmlFor="email">Email</label>
        <input id="email" className="os-input" value={email} disabled readOnly />
        <p className="os-hint">
          Your email signs you in, receives your invoices, and is what bookings
          are matched to — message the studio to change it and we&apos;ll move
          all three together.
        </p>
      </div>

      <button
        className="os-btn primary"
        disabled={!editable || pending || !dirty}
        onClick={submit}
      >
        {pending ? "…" : "Save details"}
      </button>
    </div>
  );
}

export function EmailPreferencesForm({
  preferences,
  slug,
  editable,
}: {
  preferences: EmailPreferences;
  slug: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(preferences);
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const keys = Object.keys(EMAIL_PREF_COPY) as (keyof EmailPreferences)[];
  const dirty = keys.some((k) => prefs[k] !== preferences[k]);

  const submit = () =>
    start(async () => {
      setMsg(null);
      const res = await saveEmailPreferences(slug, prefs);
      setMsg(
        res.ok
          ? { kind: "ok", text: "Preferences saved." }
          : { kind: "err", text: res.error ?? "Couldn't save." },
      );
      if (res.ok) router.refresh();
    });

  return (
    <div className="os-form">
      {msg && <p className={`os-msg ${msg.kind}`}>{msg.text}</p>}
      {!editable && (
        <ReadOnlyNote>
          Viewing as admin — these are the client&apos;s own choices, so
          they&apos;re read-only here.
        </ReadOnlyNote>
      )}

      {keys.map((key) => (
        <label className="os-toggle" key={key}>
          <input
            type="checkbox"
            checked={prefs[key]}
            disabled={!editable}
            onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
          />
          <span className="os-toggle-text">
            <strong>{EMAIL_PREF_COPY[key].label}</strong>
            <span>{EMAIL_PREF_COPY[key].note}</span>
          </span>
        </label>
      ))}

      <p className="os-hint">
        Anything switched off here still reaches you in the portal — the bell
        keeps every notice either way. Invoices, receipts and password emails
        are transactional and always send.
      </p>

      <button
        className="os-btn primary"
        disabled={!editable || pending || !dirty}
        onClick={submit}
      >
        {pending ? "…" : "Save preferences"}
      </button>
    </div>
  );
}

export function PasswordForm({ editable }: { editable: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setMsg({ kind: "err", text: "Use at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setMsg({ kind: "err", text: "Passwords don't match." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMsg({ kind: "err", text: error.message });
      return;
    }
    setPassword("");
    setConfirm("");
    setMsg({ kind: "ok", text: "Password changed." });
  };

  return (
    <form className="os-form" onSubmit={submit}>
      {msg && <p className={`os-msg ${msg.kind}`}>{msg.text}</p>}
      {!editable && (
        <ReadOnlyNote>
          Viewing as admin — this would change your own password, so it&apos;s
          disabled here.
        </ReadOnlyNote>
      )}

      <div className="os-field">
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          className="os-input"
          value={password}
          disabled={!editable}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="os-field">
        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          className="os-input"
          value={confirm}
          disabled={!editable}
          autoComplete="new-password"
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="os-btn primary"
        disabled={!editable || busy}
      >
        {busy ? "…" : "Change password"}
      </button>
    </form>
  );
}
