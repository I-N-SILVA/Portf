"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCompany(params.get("company") ?? "");
    setRef(params.get("ref") ?? "");
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
    const saved = await submitContact({
      name: payload.name ?? "",
      email: payload.email ?? "",
      message: payload.message ?? "",
      company: payload.company,
      projectType: payload.projectType,
      ref: payload.ref,
    });

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
      <div
        className="p-8 md:p-10"
        style={{ border: "1px solid var(--st-night-border)" }}
      >
        <div className="flex items-center gap-3">
          {/* .st-night .st-label supplies the gold that reads on this
              ground; an inline one would undo it. */}
          <CheckCircle2 className="h-4 w-4" style={{ color: "#c4973a" }} />
          <span className="st-label">Filed</span>
        </div>
        <h3
          className="mt-5 text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--st-serif)" }}
        >
          Message sent
        </h3>
        <p
          className="mt-3 max-w-sm text-sm leading-relaxed"
          style={{ color: "var(--st-night-dim)" }}
        >
          Thanks for reaching out — {CONTACT_FORM.RESPONSE_TIME} In the meantime,
          feel free to keep exploring the work.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="st-label st-underline st-underline-grow mt-7"
          style={{ color: "var(--st-night-dim)" }}
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
      className="p-6 text-left md:p-8"
      style={{ border: "1px solid var(--st-night-border)" }}
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
          <span className="st-label">Name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            className="st-field mt-2 w-full px-0 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="block">
          <span className="st-label">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="st-field mt-2 w-full px-0 py-2.5 text-sm outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="st-label">Company (optional)</span>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="st-field mt-2 w-full px-0 py-2.5 text-sm outline-none"
          />
        </label>
        <label className="block">
          <span className="st-label">
            What do you need?
          </span>
          <select
            name="projectType"
            defaultValue={CONTACT_FORM.PROJECT_TYPES[0]}
            className="st-field mt-2 w-full px-0 py-2.5 text-sm outline-none"
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
        <span className="st-label">
          What are you trying to solve?
        </span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="A sentence or two about the workflow that's costing you time is plenty to start."
          className="st-field mt-2 w-full resize-y px-0 py-2.5 text-sm outline-none"
        />
      </label>

      {status === "error" && (
        <div
          role="alert"
          className="mt-6 p-4 text-sm"
          style={{
            border: "1px solid var(--st-crimson)",
            color: "var(--st-night-ink)",
          }}
        >
          <p className="font-medium">
            {error ?? "That didn't send."}
          </p>
          <p className="mt-1" style={{ color: "var(--st-night-dim)" }}>
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

      <button
        type="submit"
        disabled={status === "submitting"}
        className="st-label mt-8 flex w-full items-center justify-center gap-2 px-6 py-4 transition-colors hover:bg-[var(--st-night-ink)] hover:text-[var(--st-night)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        style={{
          border: "1px solid var(--st-night-ink)",
          color: "var(--st-night-ink)",
        }}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
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
