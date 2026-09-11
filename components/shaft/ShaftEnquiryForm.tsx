"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { submitEnquiry } from "@/app/enquiry-actions";
import { useTranslation } from "@/lib/i18n";

interface Props {
  /** Which offer this is about; rides along as the project type. */
  projectType?: string;
  /**
   * What the visitor already told the terminal, in their own words. Prefills
   * the message so the field is never an empty box demanding a cover letter.
   */
  context?: string;
  className?: string;
  /** Fallback address, for the escape hatch under the form. */
  email: string;
}

/**
 * The last step of the intake: two fields and a button.
 *
 * This replaces a `mailto:` link. A mailto asks the visitor to leave the
 * page, in an application that may not be configured, and to compose a note
 * from a blank cursor — and if any of that fails the enquiry simply never
 * existed. Capturing it here means the lead is durable before the visitor
 * does anything else, and the address is still offered underneath for the
 * people who genuinely prefer their own mail client.
 *
 * The message is prefilled with the answers the terminal already collected,
 * so the visitor is editing a sentence rather than facing an empty box.
 */
export default function ShaftEnquiryForm({
  projectType,
  context,
  className,
  email: fallbackEmail,
}: Props) {
  const { t } = useTranslation();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;
    const form = new FormData(event.currentTarget);
    setState("sending");
    setError(null);

    const result = await submitEnquiry({
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
      projectType,
    });

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

  if (state === "sent") {
    return (
      <div
        className={className}
        style={{ borderColor: "rgb(var(--shaft-crimson-text))" }}
      >
        <p
          className="font-space-mono text-[11px] uppercase tracking-[0.28em]"
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
      <label
        htmlFor={`${id}-email`}
        className="block font-space-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: "rgb(var(--shaft-muted))" }}
      >
        {t("enquiry.email.label")}
      </label>
      <input
        id={`${id}-email`}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={t("enquiry.email.placeholder")}
        className="mt-2 block w-full border bg-transparent px-3 py-2.5 font-space-mono text-[13px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          borderColor: "rgb(var(--shaft-border))",
          color: "rgb(var(--shaft-cream))",
          outlineColor: "rgb(var(--shaft-crimson-text))",
        }}
      />

      <label
        htmlFor={`${id}-message`}
        className="mt-5 block font-space-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: "rgb(var(--shaft-muted))" }}
      >
        {t("enquiry.message.label")}
      </label>
      <textarea
        id={`${id}-message`}
        name="message"
        required
        rows={3}
        defaultValue={context ?? ""}
        placeholder={t("enquiry.message.placeholder")}
        className="mt-2 block w-full resize-y border bg-transparent px-3 py-2.5 text-[13px] leading-relaxed outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          borderColor: "rgb(var(--shaft-border))",
          color: "rgb(var(--shaft-cream))",
          outlineColor: "rgb(var(--shaft-crimson-text))",
        }}
      />

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 inline-flex min-h-11 items-center border px-5 font-space-mono text-[10px] uppercase tracking-[0.28em] transition-colors disabled:opacity-60"
        style={{
          borderColor: "rgb(var(--shaft-crimson-text))",
          color: "rgb(var(--shaft-crimson-text))",
        }}
      >
        {state === "sending" ? t("enquiry.sending") : t("enquiry.submit")}
      </button>

      {/*
        aria-live rather than a focus move: the visitor may still be editing a
        field when this appears, and stealing focus mid-correction is worse
        than announcing.
      */}
      <p
        ref={statusRef}
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
