"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import Accent from "./Accent";
import ShaftEnquiryForm from "./ShaftEnquiryForm";
import { EXTRAS, LANDING, MVP_TIERS } from "@/lib/offers";
import { CONTACT_EMAIL } from "@/lib/booking";

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-space-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgb(var(--shaft-muted))" }}>
      {children}
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
  role = "radio",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  role?: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={active}
      onClick={onClick}
      className="min-h-11 border px-4 py-2.5 text-[14px] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-cream))]"
      style={{
        borderColor: active ? "rgb(var(--shaft-crimson))" : "rgb(var(--shaft-border))",
        backgroundColor: active ? "rgb(var(--shaft-crimson) / 0.14)" : "transparent",
        color: active ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-cream-dim))",
      }}
    >
      {role === "checkbox" && <span aria-hidden="true" className="mr-2">{active ? "✓" : "+"}</span>}
      {children}
    </button>
  );
}

/**
 * The project brief: what they need, which extras, and when, ending in the
 * enquiry form. Lives on its own unlisted page (/brief) that Ian sends to
 * prospects, so the landing stays focused on booking a call.
 */
export default function ShaftRequestBuilder() {
  const { t } = useTranslation();
  const [need, setNeed] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [when, setWhen] = useState<string | null>(null);

  const needLabel = (id: string) => {
    if (id === "auth" || id === "payments") {
      const p = MVP_TIERS.find((x) => x.id === id)!.price;
      return `${t(`request.opt.${id}`)} · ${p}`;
    }
    if (id === "landing") return `${t("request.opt.landing")} · ${LANDING.price}`;
    return t("request.opt.unsure");
  };

  const manifest = () => {
    const lines: { label: string; value: string }[] = [];
    if (need) lines.push({ label: t("enquiry.field.offer"), value: needLabel(need) });
    if (extras.length) lines.push({ label: t("request.extrasField"), value: extras.map((x) => t(`extra.${x}`)).join(", ") });
    if (when) lines.push({ label: t("enquiry.field.when"), value: t(`intake.q2.${when}`) });
    return lines;
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div>
        <h1
          className="font-playfair font-black leading-[1] tracking-tight"
          style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(36px, 4.4vw, 64px)" }}
        >
          <Accent text={t("request.title")} />
        </h1>
        <p className="mt-4 max-w-sm text-[16px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
          {t("request.sub")}
        </p>
      </div>

      <div className="space-y-8">
        <fieldset>
          <legend className="mb-3"><Mono>{t("request.what")}</Mono></legend>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {["auth", "payments", "landing", "unsure"].map((id) => (
              <Chip key={id} active={need === id} onClick={() => setNeed(need === id ? null : id)}>
                {needLabel(id)}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3"><Mono>{t("request.extras")}</Mono></legend>
          <div className="flex flex-wrap gap-2">
            {EXTRAS.map((id) => (
              <Chip
                key={id}
                role="checkbox"
                active={extras.includes(id)}
                onClick={() => setExtras((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))}
              >
                {t(`extra.${id}`)}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3"><Mono>{t("request.when")}</Mono></legend>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {["a", "b", "c"].map((id) => (
              <Chip key={id} active={when === id} onClick={() => setWhen(when === id ? null : id)}>
                {t(`intake.q2.${id}`)}
              </Chip>
            ))}
          </div>
        </fieldset>

        <ShaftEnquiryForm
          className="border-t pt-8"
          projectType={need ? needLabel(need) : "Project brief"}
          transcript={manifest()}
          email={CONTACT_EMAIL}
        />
      </div>
    </div>
  );
}
