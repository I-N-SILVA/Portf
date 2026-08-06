"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePitchPage } from "../actions";
import { routes, siteUrl } from "@/lib/routes";
import type { CaseStudy } from "@/lib/client-content";
import type { ClientPage } from "@/lib/supabase/types";

/**
 * Editor for the public half of /c/{slug}. Case studies are picked from the
 * ones that actually exist, so a published page can't reference a slug that
 * was renamed in lib/client-content.ts.
 */
export function PitchPageAdmin({
  clientId,
  slug,
  page,
  options,
}: {
  clientId: string;
  slug: string;
  page: ClientPage | null;
  options: Pick<CaseStudy, "slug" | "headline">[];
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(page?.display_name ?? "");
  const [headline, setHeadline] = useState(page?.headline ?? "");
  const [note, setNote] = useState(page?.note ?? "");
  const [picked, setPicked] = useState<string[]>(page?.case_studies ?? []);
  const [services, setServices] = useState((page?.services ?? []).join(", "));
  const [published, setPublished] = useState(page?.published ?? false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const url = siteUrl(routes.client.root(slug));

  // Order matters — it's the display order on the page, so toggling appends.
  const toggle = (s: string) =>
    setPicked((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );

  const save = (nextPublished: boolean) =>
    startTransition(async () => {
      setError("");
      setSaved(false);
      const res = await savePitchPage(clientId, slug, {
        displayName,
        headline,
        note,
        caseStudies: picked,
        services: services.split(",").map((s) => s.trim()).filter(Boolean),
        published: nextPublished,
      });
      if (!res.ok) {
        setError(res.error ?? "Couldn't save the pitch page.");
        return;
      }
      setPublished(nextPublished);
      setSaved(true);
      router.refresh();
    });

  return (
    <div className="os-form" style={{ textAlign: "left" }}>
      {error && <p className="os-msg err">{error}</p>}
      {saved && (
        <p className="os-msg ok">
          Saved{published ? " and live" : " as a draft"}.
        </p>
      )}

      <div className="os-row">
        <span className="label">Status</span>
        <span className={`val ${published ? "gold" : ""}`}>
          {published ? "Published — anyone with the link can read it" : "Draft — only you"}
        </span>
      </div>

      <div className="os-form-row">
        <input
          className="os-input"
          value={url}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          className="os-btn"
          style={{ flex: "0 0 auto" }}
          onClick={() => {
            void navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="os-form-row">
        <input
          className="os-input"
          placeholder='Display name — shown under "Prepared for"'
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          className="os-input"
          placeholder="Services, comma separated"
          value={services}
          onChange={(e) => setServices(e.target.value)}
        />
      </div>

      <input
        className="os-input"
        placeholder="Headline (optional) — one line under their name"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />

      <textarea
        className="os-input"
        rows={6}
        placeholder="Your note to them: what you'd build, and why these projects."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ resize: "vertical", fontFamily: "var(--os-sans)" }}
      />

      <div>
        <span className="label">Case studies to show</span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "8px",
          }}
        >
          {options.map((cs) => {
            const i = picked.indexOf(cs.slug);
            return (
              <label
                key={cs.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={i >= 0}
                  onChange={() => toggle(cs.slug)}
                />
                {i >= 0 && (
                  <span className="badge" style={{ minWidth: "18px" }}>
                    {i + 1}
                  </span>
                )}
                <span>{cs.headline}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          className="os-btn primary"
          disabled={pending || !displayName}
          onClick={() => save(published)}
        >
          {pending ? "…" : "Save"}
        </button>
        {published ? (
          <button className="os-btn" disabled={pending} onClick={() => save(false)}>
            Unpublish
          </button>
        ) : (
          <button
            className="os-btn"
            disabled={pending || !displayName}
            onClick={() => save(true)}
          >
            Save &amp; publish →
          </button>
        )}
      </div>
    </div>
  );
}
