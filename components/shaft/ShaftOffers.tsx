"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, type MouseEvent } from "react";
import { useTranslation } from "@/lib/i18n";
import Accent from "./Accent";
import { LANDING, MVP_TIERS, type MvpTier } from "@/lib/offers";
import { BOOKING } from "@/lib/booking";
import { track } from "@/lib/analytics";
import { useSoundEffects } from "@/hooks/useSoundEffects";

function Mono({ children, color = "--shaft-muted" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="font-space-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: `rgb(var(${color}))` }}>
      {children}
    </span>
  );
}

/** Crimson registration marks in the four corners of the featured card. */
function Corners() {
  const base = "absolute h-4 w-4 pointer-events-none";
  const c = "rgb(var(--shaft-crimson))";
  return (
    <>
      <span aria-hidden="true" className={`${base} left-3 top-3 border-l-2 border-t-2`} style={{ borderColor: c }} />
      <span aria-hidden="true" className={`${base} right-3 top-3 border-r-2 border-t-2`} style={{ borderColor: c }} />
      <span aria-hidden="true" className={`${base} left-3 bottom-3 border-l-2 border-b-2`} style={{ borderColor: c }} />
      <span aria-hidden="true" className={`${base} right-3 bottom-3 border-r-2 border-b-2`} style={{ borderColor: c }} />
    </>
  );
}


export default function ShaftOffers() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();
  const reduceMotion = useReducedMotion();
  const [tier, setTier] = useState<MvpTier>("auth");

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const active = MVP_TIERS.find((x) => x.id === tier)!;

  // Spotlight that follows the cursor across the featured card.
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || reduceMotion) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const pickTier = (id: MvpTier) => {
    if (id === tier) return;
    playSound("click");
    setTier(id);
  };

  const reveal = (i: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      ref={sectionRef}
      id="shaft-offers"
      className="relative scroll-mt-20 overflow-hidden py-20 md:py-28"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute right-0 top-10 font-playfair font-black leading-none pointer-events-none select-none shaft-glitch"
        style={{ fontSize: "clamp(120px, 22vw, 320px)", color: "rgb(var(--shaft-surface))", y: watermarkY }}
      >
        03
      </motion.div>

      <div className="relative z-10 px-6 md:px-16 lg:px-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-10 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
          <Mono>{t("offers.section")}</Mono>
          <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
        </div>
        <h2
          className="font-playfair font-black leading-[0.95] tracking-tight max-w-[900px]"
          style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(40px, 5.6vw, 84px)" }}
        >
          <Accent text={t("offers.title")} />
        </h2>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
          {t("offers.subtitle")}
        </p>

        {/* ── Featured: MVP Sprint ── */}
        <motion.div
          {...reveal(0)}
          ref={cardRef}
          onMouseMove={onMove}
          className="group relative mt-14 border"
          style={{
            borderColor: "rgb(var(--shaft-border))",
            backgroundColor: "rgb(var(--shaft-surface))",
            backgroundImage:
              "radial-gradient(520px circle at var(--mx, 75%) var(--my, 20%), rgb(var(--shaft-crimson) / 0.13), transparent 60%)",
          }}
        >
          <Corners />

          <div
            className="flex items-center justify-between gap-4 border-b px-7 py-3 lg:px-10"
            style={{ borderColor: "rgb(var(--shaft-border))" }}
          >
            <Mono>{t("mvp.file")}</Mono>
            <span className="hidden sm:inline"><Mono>{t("mvp.own")}</Mono></span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            {/* What you get */}
            <div className="p-7 lg:p-12">
              <h3
                className="font-playfair font-black leading-[0.9] tracking-tight"
                style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(44px, 5vw, 76px)" }}
              >
                {t("mvp.name")}
              </h3>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                {t("mvp.body")}
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: MVP_TIERS[0].includes }, (_, k) => (
                  <li key={k} className="flex gap-3 text-[15px] leading-snug" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                    <span aria-hidden="true" style={{ color: "rgb(var(--shaft-muted))" }}>+</span>
                    {t(`mvp.inc.auth.${k + 1}`)}
                  </li>
                ))}
              </ul>

              <AnimatePresence initial={false}>
                {tier === "payments" && (
                  <motion.div
                    key="payments"
                    initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-7 border-t pt-6" style={{ borderColor: "rgb(var(--shaft-border))" }}>
                      <Mono>{t("mvp.everything")}</Mono>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {Array.from({ length: MVP_TIERS[1].includes }, (_, k) => (
                          <li key={k} className="flex gap-3 text-[15px] leading-snug" style={{ color: "rgb(var(--shaft-cream))" }}>
                            <span aria-hidden="true" style={{ color: "rgb(var(--shaft-muted))" }}>+</span>
                            {t(`mvp.inc.payments.${k + 1}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price panel */}
            <div
              className="flex flex-col border-t p-7 lg:border-l lg:border-t-0 lg:p-12"
              style={{ borderColor: "rgb(var(--shaft-border))", backgroundColor: "rgb(var(--shaft-bg) / 0.55)" }}
            >
              <div
                role="radiogroup"
                aria-label={t("mvp.name")}
                className="relative grid grid-cols-2 border p-1"
                style={{ borderColor: "rgb(var(--shaft-border))" }}
              >
                {MVP_TIERS.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    role="radio"
                    aria-checked={tier === x.id}
                    onClick={() => pickTier(x.id)}
                    className="relative z-10 min-h-11 px-2 sm:px-3 py-2.5 font-space-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.06em] sm:tracking-[0.14em] whitespace-nowrap transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-cream))]"
                    style={{ color: tier === x.id ? "#fff" : "rgb(var(--shaft-muted))" }}
                  >
                    {tier === x.id && (
                      <motion.span
                        layoutId="mvp-tier-pill"
                        className="absolute inset-0 -z-10"
                        style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    {t(`mvp.tier.${x.id}`)}
                  </button>
                ))}
              </div>

              <div className="mt-10 overflow-hidden" aria-live="polite">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={active.id}
                    initial={reduceMotion ? false : { y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduceMotion ? undefined : { y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="font-playfair font-black leading-none tracking-tight"
                    style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(64px, 7vw, 104px)" }}
                  >
                    {active.price}
                  </motion.div>
                </AnimatePresence>
              </div>
              <p className="mt-3 font-space-mono text-[12px] uppercase tracking-[0.16em]" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                {active.window} {t("mvp.weeks")}
              </p>
              <p className="mt-2 mb-10 text-[14px]" style={{ color: "rgb(var(--shaft-muted))" }}>
                {t("mvp.fixed")}
              </p>

              <a
                href={BOOKING.fitCall}
                {...track("book-call", { location: "offer-mvp" })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound("click")}
                className="group/cta mt-10 lg:mt-auto inline-flex min-h-14 w-full items-center justify-center gap-3 px-8 py-5 text-[16px] font-semibold transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--shaft-cream))]"
                style={{ backgroundColor: "rgb(var(--shaft-crimson))", color: "#fff" }}
              >
                {t("mvp.cta")}
                <span aria-hidden="true" className="transition-transform duration-150 group-hover/cta:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* ── Small offer: landing page ── */}
        <motion.div
          {...reveal(1)}
          className="mt-px grid gap-6 border p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-10"
          style={{ borderColor: "rgb(var(--shaft-border))", backgroundColor: "rgb(var(--shaft-bg))" }}
        >
          <div>
            <h3 className="font-playfair text-[32px] font-black leading-none" style={{ color: "rgb(var(--shaft-cream))" }}>
              {t("landing.name")}
            </h3>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
              {t("landing.body")}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {Array.from({ length: LANDING.includes }, (_, k) => (
                <li key={k} className="text-[14px]" style={{ color: "rgb(var(--shaft-muted))" }}>
                  <span aria-hidden="true" className="mr-2" style={{ color: "rgb(var(--shaft-muted))" }}>+</span>
                  {t(`landing.inc.${k + 1}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-6 lg:justify-end">
            <div className="flex items-baseline gap-2">
              <Mono>{t("landing.from")}</Mono>
              <span className="font-playfair text-[48px] font-black leading-none" style={{ color: "rgb(var(--shaft-cream))" }}>
                {LANDING.price}
              </span>
            </div>
            <a
              href={BOOKING.fitCall}
                {...track("book-call", { location: "offer-landing" })}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center gap-2 border px-6 py-3 text-[15px] font-semibold transition-colors duration-150 hover:bg-[rgb(var(--shaft-crimson))] hover:text-white"
              style={{ borderColor: "rgb(var(--shaft-crimson))", color: "rgb(var(--shaft-cream))" }}
            >
              {t("landing.cta")} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>
        <p className="mt-4 text-[14px]" style={{ color: "rgb(var(--shaft-muted))" }}>
          {t("landing.note")}
        </p>

      </div>
    </section>
  );
}
