"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  inviteClientUser,
  saveClientNotes,
  updateClientRecord,
} from "../actions";
import { routes, slugify } from "@/lib/routes";
import type {
  Client,
  ClientPrivate,
  ClientStatus,
  ClientTier,
} from "@/lib/supabase/types";

const TIERS: ClientTier[] = ["project", "subscription", "hybrid"];
const STATUSES: ClientStatus[] = ["prospect", "active", "paused", "churned"];

/**
 * The client record, their private notes, and the invite.
 *
 * Notes live in `client_private` — a separate table with an admin-only
 * policy — because a client can read their own `clients` row and RLS cannot
 * hide a column inside a row it grants. Nothing typed here is ever visible
 * to them.
 */
export function ClientRecordAdmin({
  client,
  privateData,
  hasUser,
}: {
  client: Client;
  privateData: ClientPrivate | null;
  /** Whether a profile already points at this client — i.e. already invited. */
  hasUser: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(client.name);
  const [company, setCompany] = useState(client.company ?? "");
  const [email, setEmail] = useState(client.email);
  const [slug, setSlug] = useState(client.slug);
  const [tier, setTier] = useState<ClientTier>(client.tier);
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [notes, setNotes] = useState(privateData?.notes ?? "");
  const [tags, setTags] = useState((privateData?.tags ?? []).join(", "));

  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const saveRecord = () =>
    startTransition(async () => {
      setMsg(null);
      const res = await updateClientRecord(client.id, {
        name,
        company,
        email,
        slug,
        tier,
        status,
      });
      setMsg(
        res.ok
          ? { kind: "ok", text: "Record saved." }
          : { kind: "err", text: res.error ?? "Couldn't save." },
      );
      if (res.ok) router.refresh();
    });

  const saveNotes = () =>
    startTransition(async () => {
      setMsg(null);
      const res = await saveClientNotes(
        client.id,
        notes,
        tags.split(",").map((t) => t.trim()).filter(Boolean),
      );
      setMsg(
        res.ok
          ? { kind: "ok", text: "Notes saved — private to you." }
          : { kind: "err", text: res.error ?? "Couldn't save notes." },
      );
      if (res.ok) router.refresh();
    });

  const invite = () =>
    startTransition(async () => {
      setMsg(null);
      const res = await inviteClientUser(client.id);
      setMsg(
        res.ok
          ? { kind: "ok", text: `Invite sent to ${res.data}.` }
          : { kind: "err", text: res.error ?? "Couldn't send the invite." },
      );
      if (res.ok) router.refresh();
    });

  const slugChanged = slug !== client.slug;

  return (
    <div className="os-form" style={{ textAlign: "left" }}>
      {msg && <p className={`os-msg ${msg.kind}`}>{msg.text}</p>}

      <div className="os-form-row">
        <input
          className="os-input"
          placeholder="Contact name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="os-input"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="os-form-row">
        <input
          className="os-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="os-input"
          value={tier}
          onChange={(e) => setTier(e.target.value as ClientTier)}
          style={{ flex: "0 0 auto", maxWidth: "160px" }}
        >
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="os-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as ClientStatus)}
          style={{ flex: "0 0 auto", maxWidth: "160px" }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="os-form-row">
        <input
          className="os-input"
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
        />
        <span
          className="os-empty"
          style={{ margin: 0, alignSelf: "center", flex: 1 }}
        >
          {routes.client.root(slug || "…")}
        </span>
      </div>

      {slugChanged && (
        <p className="os-msg err">
          Changing the slug breaks every link you&apos;ve already sent —
          bookmarks, proposal emails, nudge CTAs. Only do it before the first
          share.
        </p>
      )}

      <button
        className="os-btn primary"
        disabled={pending || !name || !email || !slug}
        onClick={saveRecord}
        style={{ alignSelf: "flex-start" }}
      >
        {pending ? "…" : "Save record"}
      </button>

      <div className="os-sec" style={{ marginTop: "16px" }}>
        Private notes
      </div>
      <p className="os-empty" style={{ margin: 0 }}>
        Admin-only. Stored in <code>client_private</code>, which the client has
        no policy to read.
      </p>
      <textarea
        className="os-input"
        rows={5}
        placeholder="What you actually think — scope risks, budget, who decides."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ resize: "vertical", fontFamily: "var(--os-sans)" }}
      />
      <input
        className="os-input"
        placeholder="Tags, comma separated"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button
        className="os-btn"
        disabled={pending}
        onClick={saveNotes}
        style={{ alignSelf: "flex-start" }}
      >
        {pending ? "…" : "Save notes"}
      </button>

      <div className="os-sec" style={{ marginTop: "16px" }}>
        Portal access
      </div>
      {hasUser ? (
        <p className="os-empty" style={{ margin: 0 }}>
          Invited — signing in at{" "}
          <b style={{ color: "var(--os-ink)" }}>{routes.client.root(slug)}</b>{" "}
          now shows them their dashboard instead of the pitch page. Re-sending
          the invite issues a fresh link.
        </p>
      ) : (
        <p className="os-empty" style={{ margin: 0 }}>
          Not invited yet. Until then {routes.client.root(slug)} serves the
          pitch page to anyone with the link.
        </p>
      )}
      <button
        className="os-btn"
        disabled={pending}
        onClick={invite}
        style={{ alignSelf: "flex-start" }}
      >
        {pending ? "…" : hasUser ? "Re-send invite" : "Send invite →"}
      </button>
    </div>
  );
}
