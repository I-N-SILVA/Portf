"use client";

import { motion, useReducedMotion, useScroll, useTransform, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTranslation } from "@/lib/i18n";
import { BOOKING } from "@/lib/booking";
import ShaftDecipher from "./ShaftDecipher";
import PaperPortrait from "./PaperPortrait";
import { accentRuns, plain } from "@/lib/accent";

/**
 * Word-by-word blur-in for the headline: kinetic, but it settles fast. A
 * *marked* run turns Playfair italic in crimson.
 */
function BlurWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  let n = 0;
  return (
    <>
      <span className="sr-only">{plain(text)}</span>
      {accentRuns(text).flatMap((run, r) =>
        run.text.split(/(\s+)/).filter(Boolean).map((word, w) => {
          if (/^\s+$/.test(word)) return <span key={`${r}-${w}`} aria-hidden="true">{" "}</span>;
          const i = n++;
          return (
            <motion.span
              key={`${r}-${w}`}
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0, filter: "blur(12px)", y: 14 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.55, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block will-change-transform"
            >
              {word}
            </motion.span>
          );
        }),
      )}
    </>
  );
}

/**
 * Floating project fragments behind the hero, brought back from the earlier
 * build: grayscale, softly blurred, drifting with the cursor at their own
 * depth. Still under reduced motion.
 */
const SHARDS = [
  { img: "/projects/notchy-site.webp", top: "12%", left: "6%", size: 132, rot: 12 },
  { img: "/projects/stocksnap.webp", top: "66%", left: "3%", size: 168, rot: -9 },
  { img: "/projects/florita.webp", top: "8%", left: "52%", size: 112, rot: 6 },
  { img: "/projects/snaqr.webp", top: "78%", left: "46%", size: 124, rot: -16 },
  { img: "/projects/terminal-dj-spectrum.webp", top: "40%", left: "90%", size: 104, rot: 18 },
];

function HUDShard({
  img, top, left, size, rot, index, springX, springY,
}: {
  img: string; top: string; left: string; size: number; rot: number; index: number;
  springX: MotionValue<number>; springY: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const depth = 1.4 + index * 0.45;
  const x = useTransform(springX, (v) => v * depth);
  const y = useTransform(springY, (v) => v * depth);
  return (
    <motion.div className="absolute" style={{ top, left, width: size, height: size, x, y }}>
      <motion.div
        className="relative h-full w-full overflow-hidden border border-white/10 grayscale blur-[1.5px]"
        style={{ rotate: rot }}
        animate={reduceMotion ? undefined : { y: [0, -18, 0], rotate: [rot, rot + 4, rot] }}
        transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.7 }}
      >
        <Image src={img} alt="" fill sizes="170px" className="object-cover opacity-70" />
        <div className="absolute inset-0 shaft-scanline opacity-40" />
      </motion.div>
    </motion.div>
  );
}

export default function ShaftHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { playSound } = useSoundEffects();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [posterCut, setPosterCut] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  const watermarkY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const frameY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const watermarkX = useTransform(springX, (v) => v * -0.5);
  const plateX = useTransform(springX, (v) => v * 0.65);
  const plateY = useTransform(springY, (v) => v * 0.65);
  const slashX = useTransform(springX, (v) => v * 1.1);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, reduceMotion]);

  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      ref={sectionRef}
      id="shaft-hero"
      className="relative min-h-[100svh] flex items-center overflow-hidden pt-24 pb-28 md:py-0"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      <div className="shaft-light-leak" aria-hidden="true" />
      <div className="shaft-scanline" />
      <div className="shaft-grain" aria-hidden="true" />
      <div className="shaft-vignette" />

      {/* ── Background geometry ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 hidden md:block opacity-[0.22]">
          {SHARDS.map((sh, i) => (
            <HUDShard key={sh.img} {...sh} index={i} springX={springX} springY={springY} />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-6 md:left-16 lg:left-24 w-px opacity-35"
          style={{ backgroundColor: "rgb(var(--shaft-border))" }}
        />
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-[14%] h-px opacity-30 hidden md:block"
          style={{ backgroundColor: "rgb(var(--shaft-border))" }}
        />
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 bottom-[12%] h-px opacity-20 hidden md:block"
          style={{ backgroundColor: "rgb(var(--shaft-border))" }}
        />

        <motion.div
          className="absolute right-[4%] top-1/2 -translate-y-1/2 font-playfair font-black leading-none select-none shaft-glitch"
          style={{
            fontSize: "clamp(120px, 28vw, 380px)",
            color: "rgb(var(--shaft-surface))",
            y: watermarkY,
            x: watermarkX,
          }}
          aria-hidden="true"
        >
          01
        </motion.div>

        {/* ── Portrait plate, desktop ── */}
        <motion.div className="absolute inset-0 hidden md:block" style={{ y: frameY }} aria-hidden="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.75 }}
            className="absolute right-[8.5%] lg:right-[10.5%] top-[13%] w-[29vw] max-w-[420px] h-[70vh] max-h-[640px]"
            style={{ border: "1px solid rgb(var(--shaft-border))", x: springX, y: springY }}
          />

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => {
              setPosterCut(true);
              playSound("shutter");
            }}
            onMouseLeave={() => setPosterCut(false)}
            className="pointer-events-auto cursor-pointer absolute right-[10%] lg:right-[12%] top-[15%] w-[29vw] max-w-[420px] h-[70vh] max-h-[640px] flex flex-col border"
            style={{
              borderColor: posterCut ? "rgb(var(--shaft-crimson))" : "rgb(var(--shaft-border))",
              backgroundColor: "rgb(var(--shaft-surface))",
              x: plateX,
              y: plateY,
            }}
          >
            <div
              className="flex items-center justify-between px-3.5 py-2 border-b font-space-mono text-[9px] tracking-[0.24em] uppercase shrink-0 z-20"
              style={{
                borderColor: "rgb(var(--shaft-border))",
                backgroundColor: "rgb(var(--shaft-bg) / 0.9)",
                color: "rgb(var(--shaft-muted))",
              }}
            >
              <span>Fig. 01 · Ian N. Silva</span>
              <span style={{ color: "rgb(var(--shaft-muted))" }}>
                {posterCut ? "[ 静止画 · CUT B ]" : "[ HOVER · CUT A ]"}
              </span>
            </div>

            <div className="relative flex-1 w-full">
              <PaperPortrait src="/brand-avatar.webp" mx={springX} my={springY} scroll={scrollYProgress} flat={posterCut} />
              <div
                className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgb(var(--shaft-surface) / 0.85), transparent)" }}
              />
              <div className="absolute inset-0 shaft-scanline opacity-20 pointer-events-none" />
            </div>

            <div
              className="flex items-center justify-between px-3.5 py-2 border-t font-space-mono text-[9px] tracking-[0.24em] uppercase shrink-0 z-20"
              style={{
                borderColor: "rgb(var(--shaft-border))",
                backgroundColor: "rgb(var(--shaft-bg) / 0.92)",
                color: "rgb(var(--shaft-muted))",
              }}
            >
              <span>MVPs · Landing pages</span>
              <span>Est. 2026</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.75 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="absolute"
            style={{
              right: "8%",
              top: "11.5%",
              width: "16vw",
              height: "1px",
              backgroundColor: "rgb(var(--shaft-crimson))",
              rotate: "1.5deg",
              transformOrigin: "left center",
              x: slashX,
            }}
          />
        </motion.div>

        {/* ── Portrait, mobile ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.22, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-0 right-0 w-[60vw] h-[36vh] md:hidden"
          aria-hidden="true"
        >
          <Image src="/hero-portrait.webp" alt="" fill sizes="(max-width: 767px) 60vw, 1px" className="object-contain object-bottom" />
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{ background: "linear-gradient(to top, rgb(var(--shaft-bg)), transparent)" }}
          />
        </motion.div>
      </div>

      {/* ── Copy ── */}
      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24">
        <div className="max-w-full md:max-w-[55%]">
          <motion.div
            {...enter(0.05)}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6"
          >
            <span className="font-space-mono text-[11px] md:text-[12px] tracking-[0.16em] uppercase" style={{ color: "rgb(var(--shaft-muted))" }}>
              {t("hero.eyebrow")}
            </span>
          </motion.div>

          <h1
            className="font-playfair font-black leading-[0.95] tracking-tight"
            style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(40px, 6vw, 96px)" }}
          >
            <BlurWords text={t("hero.title")} delay={0.1} />
          </h1>

          <motion.div
            className="h-px w-full mt-7 origin-left"
            style={{ backgroundColor: "rgb(var(--shaft-border))" }}
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          />

          <motion.p
            {...enter(0.3)}
            className="mt-6 max-w-[34rem] text-[17px] md:text-[19px] leading-[1.6]"
            style={{ color: "rgb(var(--shaft-cream-dim))" }}
          >
            {t("hero.sub")}
          </motion.p>

          <motion.div {...enter(0.4)} className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4 relative z-20">
            <a
              href={BOOKING.fitCall}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("click")}
              className="group relative inline-flex min-h-14 items-center gap-3 overflow-hidden px-8 py-[18px] text-[16px] font-semibold transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--shaft-cream))]"
              style={{ backgroundColor: "rgb(var(--shaft-crimson))", color: "#fff" }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />
              <span className="relative">{t("hero.cta")}</span>
              <span aria-hidden="true" className="relative transition-transform duration-200 group-hover:translate-x-1.5">→</span>
            </a>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                document.getElementById("shaft-archive")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex min-h-14 items-center gap-3 border px-8 py-[18px] text-[16px] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[rgb(var(--shaft-cream))] hover:text-[rgb(var(--shaft-bg))]"
              style={{
                borderColor: "rgb(var(--shaft-cream) / 0.55)",
                color: "rgb(var(--shaft-cream))",
                backgroundColor: "rgb(var(--shaft-surface) / 0.6)",
              }}
            >
              {t("hero.viewWork")}
              <span aria-hidden="true">↓</span>
            </button>
          </motion.div>

          <motion.p
            {...enter(0.5)}
            className="mt-6 flex items-center gap-2.5 font-space-mono text-[11px] tracking-[0.14em] uppercase"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
            {t("hero.note")}
          </motion.p>
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <motion.button
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        onClick={() => {
          playSound("click");
          document.getElementById("shaft-archive")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="absolute bottom-6 md:bottom-8 left-6 md:left-16 lg:left-24 hidden md:flex items-center gap-4 z-20"
        aria-label="Scroll to the work"
      >
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10"
          style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
        />
        <span className="font-space-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgb(var(--shaft-muted))" }}>
          <ShaftDecipher text={t("hero.scroll")} />
        </span>
      </motion.button>

      <div
        className="absolute bottom-6 md:bottom-8 right-6 md:right-16 lg:right-24 hidden md:block font-space-mono text-[10px] tracking-[0.3em] uppercase z-20"
        style={{ color: "rgb(var(--shaft-muted))" }}
        aria-hidden="true"
      >
        {t("hero.scene")}
      </div>
    </section>
  );
}
