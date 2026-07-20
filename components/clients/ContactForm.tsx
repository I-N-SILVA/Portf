"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { CONTACT_FORM, CLIENT_SITE } from "@/lib/client-content";

type Status = "idle" | "submitting" | "success" | "error";

const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  // Prefill from the URL — pitch rooms link here as
  // /clients?company=Acme&ref=acme#contact so the form arrives personalized.
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
    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-playfair text-2xl font-bold text-stone-900">
          Message sent
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
          Thanks for reaching out — {CONTACT_FORM.RESPONSE_TIME} In the meantime,
          feel free to keep exploring the work.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-stone-500 underline underline-offset-4 transition-colors hover:text-stone-900"
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
      className="rounded-2xl bg-white p-6 text-left md:p-8"
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
          <span className="text-sm font-medium text-stone-700">Name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors focus:border-stone-900 focus:bg-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors focus:border-stone-900 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">
            Company{" "}
            <span className="font-normal text-stone-400">(optional)</span>
          </span>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors focus:border-stone-900 focus:bg-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">
            What do you need?
          </span>
          <select
            name="projectType"
            defaultValue={CONTACT_FORM.PROJECT_TYPES[0]}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors focus:border-stone-900 focus:bg-white"
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
        <span className="text-sm font-medium text-stone-700">
          What are you trying to solve?
        </span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="A sentence or two about the workflow that's costing you time is plenty to start."
          className="mt-1.5 w-full resize-y rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-900 focus:bg-white"
        />
      </label>

      {status === "error" && (
        <p className="mt-4 text-sm text-red-600">
          Something went wrong sending that. Please email me directly at{" "}
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="underline underline-offset-2"
          >
            {CLIENT_SITE.EMAIL}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
