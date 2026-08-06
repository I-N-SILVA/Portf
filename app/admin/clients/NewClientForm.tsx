"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientRecord, suggestSlug } from "./actions";
import { routes, slugify } from "@/lib/routes";
import type { ClientStatus, ClientTier } from "@/lib/supabase/types";

const TIERS: ClientTier[] = ["project", "subscription", "hybrid"];
const STATUSES: ClientStatus[] = ["prospect", "active", "paused", "churned"];

/**
 * Creating a client used to mean opening the Supabase SQL console. The slug
 * is the important field — it's the URL you hand the prospect — so it gets a
 * live preview and a server-side availability check rather than a bare input.
 */
export function NewClientForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tier, setTier] = useState<ClientTier>("hybrid");
  const [status, setStatus] = useState<ClientStatus>("prospect");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Track the name/company until the admin edits the slug by hand, then stop.
  const syncSlug = (source: string) => {
    if (slugTouched) return;
    setSlug(slugify(source));
    startTransition(async () => {
      const res = await suggestSlug(source);
      if (res.ok && res.data) setSlug(res.data);
    });
  };

  const submit = () =>
    startTransition(async () => {
      setError("");
      const res = await createClientRecord({
        name,
        company,
        email,
        slug,
        tier,
        status,
      });
      if (!res.ok || !res.data) {
        setError(res.error ?? "Couldn't create that client.");
        return;
      }
      setOpen(false);
      router.push(routes.admin.client(res.data.id));
      router.refresh();
    });

  if (!open) {
    return (
      <button className="os-btn" onClick={() => setOpen(true)}>
        + New client
      </button>
    );
  }

  return (
    <div className="os-form" style={{ textAlign: "left", marginTop: "12px" }}>
      {error && <p className="os-msg err">{error}</p>}

      <div className="os-form-row">
        <input
          className="os-input"
          placeholder="Contact name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!company) syncSlug(e.target.value);
          }}
        />
        <input
          className="os-input"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            syncSlug(e.target.value || name);
          }}
        />
      </div>

      <input
        className="os-input"
        type="email"
        placeholder="Email — where the invite goes"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="os-form-row">
        <input
          className="os-input"
          placeholder="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
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

      <p className="os-empty" style={{ margin: 0 }}>
        Their space will live at{" "}
        <b style={{ color: "var(--os-ink)" }}>
          {routes.client.root(slug || "…")}
        </b>{" "}
        — one link, from first pitch through to invoicing.
      </p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className="os-btn primary"
          disabled={pending || !name || !email || !slug}
          onClick={submit}
        >
          {pending ? "…" : "Create client →"}
        </button>
        <button className="os-btn ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
