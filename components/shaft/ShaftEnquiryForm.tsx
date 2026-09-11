"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { submitEnquiry } from "@/app/enquiry-actions";
import { useTranslation } from "@/lib/i18n";

interface Props {
  /** Which offer this is about; rides along as the project type. */
  projectType?: string;
  /**
   * What the terminal already collected, as labelled lines. Shown as a
   * standing record rather than poured into a textarea.
   */
  transcript?: { label: string; value: string }[];
  className?: string;
  /** Fallback address, for the escape hatch under the form. */
  email: string;
}

/**
 * The last command in the terminal, not a contact form stapled to the end of
 * one.
 *
 * The first version dumped the three answers into a textarea as one run-on
 * string and asked the visitor to edit it. That is backwards: those answers
 * are already correct, and presenting them as editable prose invited people
 * to rewrite what the terminal had carefully structured — while hiding the
 * fact that a real record was being assembled.
 *
 * So the answers are a manifest, printed as fixed field lines the way the
 * rest of the drawer prints things. Only two things are actually asked: an
 * address, and anything the manifest does not already say. The visitor sees
 * a dispatch being filled in and signs the bottom of it.
 */
export default function ShaftEnquiryForm({
  projectType,
  transcript = [],
  className,
  email: fallbackEmail,
}: Props) {
  const { t } = useTranslation();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;
    const form = new FormData(event.currentTarget);
    setState("sending");
    setError(null);

    // The manifest is the message. A note, if there is one, is appended under
    // it — so what lands in /admin reads as a record rather than a sentence
    // that has to be decoded back into fields.
    const note = String(form.get("note") ?? "").trim();
    const manifest = transcript.map((line) => `${line.label}: ${line.value}`).join("\n");
    const message = note ? `${manifest}\n\n${note}` : manifest;

    const result = await submitEnquiry({
      email: String(form.get("email") ?? ""),
      message,
      projectType,
    }).catch(() => ({ ok: false as const, error: "unavailable" as const }));

    if (result.ok) {
      setState("sent");
      return;
    }
    setState("error");
    setError(
      result.error === "throttled"
        ? t("enquiry.error.throttled")
        : result.error === "invalid"
          ? t("enquiry.error.invalid")
          : t("enquiry.error.unavailable"),
    );
  };

  /* ── The stamped slip ──────────────────────────────────────────────── */
  if (state === "sent") {
    return (
      <div className={className}>
        <p
          className="font-space-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "rgb(var(--shaft-crimson-text))" }}
        >
          {t("enquiry.sent.title")}
        </p>
        <p
          className="mt-3 text-[13px] leading-relaxed"
          style={{ color: "rgb(var(--shaft-cream-dim))" }}
        >
          {t("enquiry.sent.body")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      {/*
        The manifest. Read-only on purpose: these came from the terminal and
        are already right. Rendered as a definition list because that is what
        it is — labelled values, not a paragraph.
      */}
      {transcript.length > 0 && (
        <dl className="mb-7">
          {transcript.map((line) => (
            <div
              key={line.label}
              className="flex gap-4 border-b py-2 last:border-b-0"
              style={{ borderColor: "rgb(var(--shaft-border))" }}
            >
              <dt
                className="w-20 shrink-0 font-space-mono text-[9px] uppercase leading-5 tracking-[0.2em]"
                style={{ color: "rgb(var(--shaft-muted))" }}
              >
                {line.label}
              </dt>
              <dd
                className="flex-1 text-[12px] leading-5"
                style={{ color: "rgb(var(--shaft-cream-dim))" }}
              >
                {line.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <label
        htmlFor={`${id}-email`}
        className="block font-space-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: "rgb(var(--shaft-muted))" }}
      >
        {t("enquiry.email.label")}
      </label>
      {/*
        A ruled line rather than a box. The drawer is built from rules and
        field labels, and a bordered input in the middle of it reads as a
        widget someone dropped in from a different site.
      */}
      <input
        id={`${id}-email`}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={t("enquiry.email.placeholder")}
        className="mt-1.5 block w-full border-0 border-b bg-transparent px-0 py-2 font-space-mono text-[14px] outline-none transition-colors placeholder:text-[rgb(var(--shaft-muted))] focus:border-b-[rgb(var(--shaft-crimson-text))] focus-visible:outline-none"
        style={{
          borderBottomColor: "rgb(var(--shaft-border))",
          color: "rgb(var(--shaft-cream))",
        }}
      />

      <label
        htmlFor={`${id}-note`}
        className="mt-6 block font-space-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: "rgb(var(--shaft-muted))" }}
      >
        {t("enquiry.note.label")}
      </label>
      <textarea
        ref={noteRef}
        id={`${id}-note`}
        name="note"
        rows={2}
        placeholder={t("enquiry.note.placeholder")}
        className="mt-1.5 block w-full resize-y border-0 border-b bg-transparent px-0 py-2 text-[13px] leading-relaxed outline-none transition-colors placeholder:text-[rgb(var(--shaft-muted))] focus:border-b-[rgb(var(--shaft-crimson-text))] focus-visible:outline-none"
        style={{
          borderBottomColor: "rgb(var(--shaft-border))",
          color: "rgb(var(--shaft-cream))",
        }}
      />

      <button
        type="submit"
        disabled={state === "sending"}
        className="group mt-7 inline-flex min-h-11 items-center gap-3 border px-5 font-space-mono text-[10px] uppercase tracking-[0.28em] transition-colors hover:bg-[rgb(var(--shaft-crimson-text))] hover:text-[rgb(var(--shaft-bg))] disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[rgb(var(--shaft-crimson-text))]"
        style={{
          borderColor: "rgb(var(--shaft-crimson-text))",
          color: "rgb(var(--shaft-crimson-text))",
        }}
      >
        {state === "sending" ? t("enquiry.sending") : t("enquiry.submit")}
        <span
          aria-hidden="true"
          className={state === "sending" ? "shaft-transmit" : undefined}
        >
          {state === "sending" ? "•••" : "→"}
        </span>
      </button>

      {/*
        aria-live rather than a focus move: the visitor may still be editing a
        field when this appears, and stealing focus mid-correction is worse
        than announcing.
      */}
      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-[1.2em] text-[12px] leading-relaxed"
        style={{ color: "rgb(var(--shaft-crimson-text))" }}
      >
        {error}
      </p>

      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "rgb(var(--shaft-muted))" }}>
        {t("enquiry.alt")}{" "}
        <a
          href={`mailto:${fallbackEmail}`}
          className="underline underline-offset-4"
          style={{ color: "rgb(var(--shaft-cream-dim))" }}
        >
          {fallbackEmail}
        </a>
      </p>
    </form>
  );
}
