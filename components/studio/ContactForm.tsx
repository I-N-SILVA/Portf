"use client";

import { useEffect, useState } from "react";
import BrandLoading from "@/components/brand/BrandLoading";
import BrandMark from "@/components/brand/BrandMark";
import { ArrowRight } from "lucide-react";
import { CONTACT_FORM, CLIENT_SITE } from "@/lib/client-content";
import { submitContact } from "@/lib/os/actions/contact";

type Status = "idle" | "submitting" | "success" | "error";

const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // Prefill from the URL — a client's pitch page links here as
  // /studio?company=Acme&ref=acme#contact so the form arrives personalized.
  const [company, setCompany] = useState("");
  const [ref, setRef] = useState("");
  const [projectType, setProjectType] = useState<string>(CONTACT_FORM.PROJECT_TYPES[0]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCompany(params.get("company") ?? "");
    setRef(params.get("ref") ?? "");
    const requestedType = params.get("projectType");
    if (
      requestedType &&
      (CONTACT_FORM.PROJECT_TYPES as readonly string[]).includes(requestedType)
    ) {
      setProjectType(requestedType);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: a filled bot-field means a bot — silently "succeed".
    if (data.get("bot-field")) {
      setStatus("success");
      return;
    }

    const payload: Record<string, string> = {
      "form-name": CONTACT_FORM.NAME,
    };
    data.forEach((value, key) => {
      payload[key] = typeof value === "string" ? value : "";
    });

    setStatus("submitting");

    // Our own record first. This is the one that decides whether the enquiry
    // survives: Netlify Forms was previously the only copy, so an outage at
    // exactly the wrong moment lost the lead with nothing to recover from.
    let saved: { ok: boolean; error?: string } = { ok: false };
    try { saved = await submitContact({
      name: payload.name ?? "",
      email: payload.email ?? "",
      message: payload.message ?? "",
      company: payload.company,
      projectType: payload.projectType,
      ref: payload.ref,
    }); } catch { saved = { ok: false, error: "Please try again or email me directly." }; }

    // Netlify Forms is now the notification channel, not the record. It is
    // what emails you that someone got in touch, so it is still worth
    // posting to — but a failure here is cosmetic once the row is saved.
    let notified = false;
    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload),
      });
      notified = res.ok;
    } catch {
      notified = false;
    }

    if (saved.ok || notified) {
      setStatus("success");
      return;
    }

    setError(saved.error ?? null);
    setStatus("error");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[var(--brand-paper-raised)] p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-paper)] text-[var(--brand-olive-ink)]">
          <BrandMark size={54} />
        </span>
        <h3 className="mt-5 font-syne text-2xl font-bold text-[var(--brand-ink)]">
          Message sent
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--brand-muted)]">
          Thanks for reaching out — {CONTACT_FORM.RESPONSE_TIME} In the meantime,
          feel free to keep exploring the work.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-[var(--brand-muted)] underline underline-offset-4 transition-colors hover:text-[var(--brand-ink)]"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      name={CONTACT_FORM.NAME}
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      aria-busy={status === "submitting"}
      className="rounded-2xl bg-[var(--brand-paper-raised)] p-6 text-left md:p-8"
    >
      {/* Netlify plumbing */}
      <input type="hidden" name="form-name" value={CONTACT_FORM.NAME} />
      {/* Attribution: which pitch room / link this lead came from */}
      <input type="hidden" name="ref" value={ref} />
      <p className="hidden">
        <label>
          Don&apos;t fill this out if you&apos;re human:{" "}
          <input name="bot-field" />
        </label>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--brand-muted)]">Name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            className="mt-1.5 w-full rounded-lg border border-[var(--brand-border-strong)] bg-[var(--brand-paper)] px-3.5 py-2.5 text-sm text-[var(--brand-ink)] outline-none transition-colors focus:border-stone-900 focus:bg-[var(--brand-paper-raised)]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--brand-muted)]">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-[var(--brand-border-strong)] bg-[var(--brand-paper)] px-3.5 py-2.5 text-sm text-[var(--brand-ink)] outline-none transition-colors focus:border-stone-900 focus:bg-[var(--brand-paper-raised)]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--brand-muted)]">
            Company{" "}
            <span className="font-normal text-[var(--brand-muted)]">(optional)</span>
          </span>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--brand-border-strong)] bg-[var(--brand-paper)] px-3.5 py-2.5 text-sm text-[var(--brand-ink)] outline-none transition-colors focus:border-stone-900 focus:bg-[var(--brand-paper-raised)]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--brand-muted)]">
            What do you need?
          </span>
          <select
            name="projectType"
            value={projectType}
            onChange={(event) => setProjectType(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--brand-border-strong)] bg-[var(--brand-paper)] px-3.5 py-2.5 text-sm text-[var(--brand-ink)] outline-none transition-colors focus:border-stone-900 focus:bg-[var(--brand-paper-raised)]"
          >
            {CONTACT_FORM.PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-[var(--brand-muted)]">
          What are you trying to solve?
        </span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="A sentence or two about the workflow that's costing you time is plenty to start."
          className="mt-1.5 w-full resize-y rounded-lg border border-[var(--brand-border-strong)] bg-[var(--brand-paper)] px-3.5 py-2.5 text-sm text-[var(--brand-ink)] outline-none transition-colors placeholder:text-stone-400 focus:border-stone-900 focus:bg-[var(--brand-paper-raised)]"
        />
      </label>

      {status === "error" && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-medium">
            {error ?? "That didn't send."}
          </p>
          <p className="mt-1 text-red-600">
            Nothing was lost on your end — the text is still in the form, so
            you can press Send again. If it keeps failing, email me directly at{" "}
            <a
              href={`mailto:${CLIENT_SITE.EMAIL}`}
              className="font-medium underline underline-offset-2"
            >
              {CLIENT_SITE.EMAIL}
            </a>
            .
          </p>
        </div>
      )}

      {status === "submitting" && <BrandLoading compact label="Sending your message" />}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <span className="inline-block h-2 w-2 bg-[var(--brand-olive)]" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
