"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { socialLinks } from "@/lib/placeholder-content";
import { useTranslation } from "@/lib/i18n";
import { BOOKING, CONTACT_EMAIL } from "@/lib/booking";
import Image from "next/image";
import Accent from "./Accent";
import { useSoundEffects, useSoundPreference } from "@/hooks/useSoundEffects";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  github: "GitHub",
  substack: "Substack",
};

const FAQ = [1, 2, 3, 4, 5] as const;
const STEPS = [1, 2, 3] as const;
const CORNERS = [
  "left-3 top-3 border-l-2 border-t-2",
  "right-3 top-3 border-r-2 border-t-2",
  "left-3 bottom-3 border-l-2 border-b-2",
  "right-3 bottom-3 border-r-2 border-b-2",
] as const;

function Mono({ children, color = "--shaft-muted" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="font-space-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: `rgb(var(${color}))` }}>
      {children}
    </span>
  );
}

function Rule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px w-10 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
      <Mono>{label}</Mono>
      <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
    </div>
  );
}

export default function ShaftCall() {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();
  const [soundOn, setSoundOn] = useSoundPreference();
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const nav = [
    { id: "shaft-archive", label: t("nav.archive") },
    { id: "shaft-offers", label: t("nav.offers") },
    { id: "shaft-call", label: t("nav.call") },
    { id: "shaft-faq", label: "FAQ" },
  ];

  return (
    <section id="shaft-call" className="relative scroll-mt-20" style={{ backgroundColor: "rgb(var(--shaft-bg))" }}>
      {/* ── Book ── */}
      <div className="px-6 md:px-16 lg:px-24 pt-20 md:pt-28">
        <Rule label={t("call.section")} />

        {/*
          Three grid items, not two: title, booking card, steps. On phones
          they stack in that order, so the button arrives right after the
          headline instead of three step boxes later. On desktop the card
          sits in the right column, spanning both rows.
        */}
        <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-x-14 lg:gap-y-14">
          <div className="lg:col-start-1 lg:row-start-1">
            <motion.h2
              {...reveal(0)}
              className="font-playfair font-black leading-[0.86] tracking-tighter"
              style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(40px, 9vw, 140px)" }}
            >
              <span className="block">{t("call.title1")}</span>
              <span aria-hidden="true" className="block h-0.5 w-full my-3" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
              <span className="block" style={{ marginLeft: "3vw" }}>{t("call.title2")}</span>
            </motion.h2>
          </div>

            <motion.div {...reveal(0.1)} className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
              <Mono>{t("call.steps.title")}</Mono>
              <ol className="mt-6 grid gap-px sm:grid-cols-3">
                {STEPS.map((n) => (
                  <li
                    key={n}
                    className="flex gap-4 p-5 shadow-[0_0_0_1px_rgb(var(--shaft-border))] sm:block sm:p-6"
                    style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
                  >
                    <span className="font-playfair text-[28px] leading-none sm:text-[44px]" style={{ color: "rgb(var(--shaft-muted))" }}>
                      {String(n).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[16px] font-semibold sm:mt-5 sm:text-[17px]" style={{ color: "rgb(var(--shaft-cream))" }}>
                        {t(`call.step.${n}.t`)}
                      </p>
                      <p className="mt-1.5 text-[14px] leading-relaxed sm:mt-2" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                        {t(`call.step.${n}.b`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>

          {/* Booking card */}
          <motion.aside
            {...reveal(0.15)}
            className="relative border p-6 sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:p-10 lg:sticky lg:top-28"
            style={{ borderColor: "rgb(var(--shaft-border))", backgroundColor: "rgb(var(--shaft-surface))" }}
          >
            {CORNERS.map((c) => (
              <span key={c} aria-hidden="true" className={`absolute h-4 w-4 ${c}`} style={{ borderColor: "rgb(var(--shaft-crimson))" }} />
            ))}
            <Mono>{t("call.card.label")}</Mono>
            <p className="mt-4 font-playfair text-[40px] font-black leading-[1]" style={{ color: "rgb(var(--shaft-cream))" }}>
              {t("call.card.title")}
            </p>
            <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
              {t("call.body")}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[1, 2, 3].map((n) => (
                <li
                  key={n}
                  className="border px-3 py-1.5 font-space-mono text-[11px] uppercase tracking-[0.14em]"
                  style={{ borderColor: "rgb(var(--shaft-border))", color: "rgb(var(--shaft-cream-dim))" }}
                >
                  {t(`call.card.meta.${n}`)}
                </li>
              ))}
            </ul>
            <a
              href={BOOKING.fitCall}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("click")}
              className="group mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 px-5 sm:px-8 py-5 text-[15px] sm:text-[17px] font-semibold transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--shaft-cream))]"
              style={{ backgroundColor: "rgb(var(--shaft-crimson))", color: "#fff" }}
            >
              {t("call.cta.open")}
              <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1">→</span>
            </a>
            <p className="mt-5 text-[14px] leading-relaxed" style={{ color: "rgb(var(--shaft-muted))" }}>
              {t("call.email.prefix")}{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: "rgb(var(--shaft-cream-dim))" }}
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <dl className="mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2" style={{ borderColor: "rgb(var(--shaft-border))" }}>
              {[
                ["standing.background", "standing.background.value"],
                ["standing.status", "standing.status.value"],
              ].map(([labelKey, valueKey]) => (
                <div key={labelKey}>
                  <dt><Mono>{t(labelKey)}</Mono></dt>
                  <dd className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                    {t(valueKey)}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="shaft-faq" className="scroll-mt-20 px-6 md:px-16 lg:px-24 py-16 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <motion.div {...reveal(0)}>
            <h3
              className="font-playfair font-black leading-[0.95] tracking-tight"
              style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(36px, 4.4vw, 64px)" }}
            >
              <Accent text={t("faq.title")} />
            </h3>
            <p className="mt-5 max-w-sm text-[16px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
              {t("faq.sub")}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4" style={{ color: "rgb(var(--shaft-cream))" }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </motion.div>

          <motion.ul {...reveal(0.08)} className="border-t" style={{ borderColor: "rgb(var(--shaft-border))" }}>
            {FAQ.map((n) => {
              const open = openFaq === n;
              return (
                <li key={n} className="border-b" style={{ borderColor: "rgb(var(--shaft-border))" }}>
                  <h4>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`faq-${n}`}
                      onClick={() => setOpenFaq(open ? null : n)}
                      className="flex w-full items-baseline gap-5 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-cream))]"
                    >
                      <span className="font-space-mono text-[12px]" style={{ color: "rgb(var(--shaft-muted))" }}>
                        {String(n).padStart(2, "0")}
                      </span>
                      <span
                        className="flex-1 font-playfair text-[22px] md:text-[26px] font-bold leading-tight transition-colors"
                        style={{ color: open ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-cream-dim))" }}
                      >
                        {t(`faq.${n}.q`)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-space-mono text-[20px] transition-transform duration-300"
                        style={{ color: "rgb(var(--shaft-muted))", transform: open ? "rotate(45deg)" : "none" }}
                      >
                        +
                      </span>
                    </button>
                  </h4>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-${n}`}
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-7 pl-10 max-w-2xl text-[16px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                          {t(`faq.${n}.a`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </motion.ul>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative overflow-hidden border-t" style={{ borderColor: "rgb(var(--shaft-border))" }}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-6 py-12 md:py-16 md:px-16 lg:grid-cols-[minmax(0,4fr)_repeat(3,minmax(0,2fr))] lg:px-24">
          <div className="col-span-2 lg:col-span-1">
            <p className="flex items-center gap-3 font-playfair text-[28px] font-black leading-none" style={{ color: "rgb(var(--shaft-cream))" }}>
              <Image src="/brand/aa-mark.svg" alt="" width={44} height={39} unoptimized className="shaft-mark h-10 w-auto shrink-0" />
              <span>Ian N. Silva<span style={{ color: "rgb(var(--shaft-crimson))" }}>.</span></span>
            </p>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
              {t("footer.bio")}
            </p>
          </div>

          <nav aria-label={t("footer.nav")}>
            <Mono>{t("footer.nav")}</Mono>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[15px] transition-colors hover:text-[rgb(var(--shaft-cream))]"
                    style={{ color: "rgb(var(--shaft-cream-dim))" }}
                  >
                    {item.label === "FAQ" ? "FAQ" : item.label.charAt(0) + item.label.slice(1).toLowerCase()}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="order-last col-span-2 lg:order-none lg:col-span-1">
            <Mono>{t("footer.contact")}</Mono>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="break-words transition-colors hover:text-[rgb(var(--shaft-cream))]" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={BOOKING.fitCall}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[rgb(var(--shaft-cream))]"
                  style={{ color: "rgb(var(--shaft-cream-dim))" }}
                >
                  {t("footer.book")} →
                </a>
              </li>
            </ul>
          </div>

          <div>
            <Mono>{t("footer.elsewhere")}</Mono>
            <ul className="mt-5 space-y-3 text-[15px]">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[rgb(var(--shaft-cream))]"
                    style={{ color: "rgb(var(--shaft-cream-dim))" }}
                  >
                    {SOCIAL_LABELS[link.icon] || link.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>


        <div
          className="flex flex-col gap-4 border-t px-6 py-6 md:flex-row md:items-center md:justify-between md:px-16 lg:px-24"
          style={{ borderColor: "rgb(var(--shaft-border))" }}
        >
          <span className="font-space-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "rgb(var(--shaft-muted))" }}>
            © {new Date().getFullYear()} Ian N. Silva · {t("footer.rights")}
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-space-mono text-[11px] uppercase tracking-[0.14em]">
            <button
              type="button"
              onClick={() => setSoundOn(!soundOn)}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute interface sound" : "Unmute interface sound"}
              className="uppercase transition-opacity hover:opacity-70"
              style={{ color: "rgb(var(--shaft-muted))" }}
            >
              {soundOn ? t("footer.sound.on") : t("footer.sound.off")}
            </button>
            <a href="#main" className="transition-opacity hover:opacity-70" style={{ color: "rgb(var(--shaft-muted))" }}>
              {t("footer.top")} ↑
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
