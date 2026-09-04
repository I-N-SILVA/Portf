"use client";

import { motion, useReducedMotion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef, useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTranslation } from "@/lib/i18n";
import ShaftDecipher from "./ShaftDecipher";
import Image from "next/image";

/* ─── Effect 1: Cinematic Blur Reveal (Active) ─────────────────────────── */
function CinematicBlurName({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className="inline-flex" aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={reduceMotion ? false : { opacity: 0, filter: "blur(16px)", scale: 1.1, x: -10 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block will-change-transform"
        >
          {char === " " ? <span>&nbsp;</span> : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── HUD Shard Sub-component ─────────────────────────────────────── */
function HUDShard({ img, top, left, size, delay, rot, index, springX, springY }: { 
  img: string; top: string; left: string; size: string; delay: number; rot: number; index: number;
  springX: MotionValue<number>; springY: MotionValue<number>;
}) {
  const x = useTransform(springX, (v: number) => v * (1 + index * 0.2));
  const yParallax = useTransform(springY, (v: number) => v * (1 + index * 0.2));

  return (
    <motion.div
      className="absolute overflow-hidden border border-white/10 grayscale blur-[1.5px] transition-all duration-1000"
      style={{
        top,
        left,
        width: size,
        height: size,
        x,
        y: yParallax,
        rotate: rot,
      }}
      animate={{
        y: [0, -20, 0],
        rotate: [rot, rot + 5, rot],
      }}
      transition={{
        duration: 5 + index,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Image
        src={img}
        alt="Shard"
        fill
        sizes={size}
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 shaft-scanline opacity-40" />
    </motion.div>
  );
}

export default function ShaftHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { playSound } = useSoundEffects();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  
  // Vertical Parallax
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const frameY     = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  // Mouse Follow Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 20);
      mouseY.set((clientY / innerHeight - 0.5) * 20);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const scrollToNext = () => {
    playSound("click");
    document.getElementById("shaft-identity")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="shaft-hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      {/* ── Background Overlays ── */}
      <div className="shaft-scanline" />
      <div className="shaft-vignette" />

      {/* ── Background geometry & Portrait Window ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* ── HUD Shards (Floating Project Fragments) ── */}
        <div className="absolute inset-0 opacity-20">
          {[
            { img: "/projects/ai-agents.webp", top: "15%", left: "10%", size: "120px", delay: 0, rot: 15 },
            { img: "/projects/calendar.webp", top: "65%", left: "5%", size: "160px", delay: 1, rot: -10 },
            { img: "/projects/defi-analytics.webp", top: "25%", left: "80%", size: "140px", delay: 2, rot: 5 },
            { img: "/projects/prompt-library.webp", top: "75%", left: "75%", size: "110px", delay: 1.5, rot: -20 },
          ].map((shard, i) => (
            <HUDShard
              key={i}
              {...shard}
              index={i}
              springX={springX}
              springY={springY}
            />
          ))}
        </div>

        {/* Large watermark number — parallax */}
        <motion.div
          className="absolute right-[4%] top-1/2 -translate-y-1/2 font-playfair font-black leading-none select-none shaft-glitch"
          style={{
            fontSize: "clamp(120px, 28vw, 380px)",
            color: "rgb(20 20 20)",
            userSelect: "none",
            y: watermarkY,
            x: useTransform(springX, (v) => v * -0.5),
          }}
          aria-hidden="true"
        >
          01
        </motion.div>

        {/* ── Desktop portrait frame ── */}
        <motion.div
          className="absolute inset-0 hidden md:block"
          style={{ y: frameY }}
          aria-hidden="true"
        >
          {/* Main Portrait Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onAnimationComplete={() => playSound("shutter")}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute right-[8%] top-[12%] w-[38vw] h-[72vh] group overflow-hidden border border-white/5"
            style={{ 
              x: useTransform(springX, (v) => v * 0.8),
              y: useTransform(springY, (v) => v * 0.8),
            }}
          >
            <Image
              src="/hero-portrait.webp"
              alt="Ian N. Silva"
              fill
              priority
              sizes="(min-width: 768px) 38vw, 1px"
              className="absolute inset-0 w-full h-full object-contain object-bottom opacity-90 drop-shadow-2xl transition-all duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 shaft-scanline opacity-20" />
            {/* Bottom gradient so portrait blends into bg */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgb(var(--shaft-bg)), transparent)" }}
            />
          </motion.div>

          {/* Rectangular secondary frame */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.9 }}
            className="absolute right-[6%] top-[10%] hidden md:block"
            style={{
              width: "14vw",
              height: "48vh",
              border: "1px solid rgb(var(--shaft-border))",
              x: springX,
              y: springY,
            }}
          />

          {/* Accent diagonal slash */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.6 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            className="absolute hidden md:block"
            style={{
              right: "5%",
              top: "9%",
              width: "18vw",
              height: "1px",
              backgroundColor: "rgb(var(--shaft-crimson))",
              transform: "rotate(1.5deg)",
              transformOrigin: "left center",
              x: useTransform(springX, (v) => v * 1.2),
            }}
          />

          {/* Bottom horizontal rule */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.4 }}
            transition={{ duration: 0.35, delay: 1.15 }}
            className="absolute hidden md:block"
            style={{
              right: "5%",
              top: "75%",
              width: "18vw",
              height: "1px",
              backgroundColor: "rgb(var(--shaft-border))",
              x: useTransform(springX, (v) => v * 0.9),
            }}
          />
        </motion.div>

        {/* ── Mobile portrait — visible below md ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.35, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-0 right-0 w-[75vw] h-[50vh] md:hidden"
        >
          <Image
            src="/hero-portrait.webp"
            alt="Ian N. Silva"
            fill
            priority
            sizes="(max-width: 767px) 75vw, 1px"
            className="object-contain object-bottom opacity-80"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgb(var(--shaft-bg)), transparent)" }}
          />
          <div className="absolute inset-0 shaft-scanline opacity-10" />
        </motion.div>
      </div>

      {/* ── Scene marker — top right ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, delay: 0.35 }}
        className="absolute top-6 right-6 md:top-8 md:right-8 font-space-mono text-[8px] md:text-[9px] tracking-[0.45em] uppercase z-20 hidden md:block"
        style={{ color: "rgb(var(--shaft-muted))" }}
      >
        {t("hero.scene")}
      </motion.div>

      {/* ── Main content — left-biased ── */}
      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24">
        <div className="max-w-full md:max-w-[62%]">

          {/* Pre-title annotation */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: 0.15 }}
            className="font-space-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase mb-4 md:mb-6"
            style={{ color: "rgb(var(--shaft-crimson))" }}
          >
            {t("hero.pretitle")}
          </motion.div>

          {/* Name — letter-by-letter kinetic reveal */}
          <div className="overflow-hidden">
            <h1
              className="font-playfair font-black leading-[0.83] tracking-tighter"
              style={{
                color: "rgb(var(--shaft-cream))",
                fontSize: "clamp(52px, 13vw, 200px)",
              }}
            >
            <CinematicBlurName text="IAN N." delay={0.1} />
            </h1>
          </div>

          <div className="overflow-hidden" style={{ marginLeft: "3vw" }}>
            <h1
              className="font-playfair font-black leading-[0.83] tracking-tighter"
              style={{
                color: "rgb(var(--shaft-cream))",
                fontSize: "clamp(52px, 13vw, 200px)",
              }}
            >
              <CinematicBlurName text="SILVA." delay={1.0} />
            </h1>
          </div>

          {/* Animated underline that traces under the name */}
          <motion.div
            className="h-px w-full mt-6 md:mt-8 mb-4 md:mb-6 origin-left"
            style={{ backgroundColor: "rgb(var(--shaft-border))" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.35, delay: 0.7 }}
          />

          {/* Tagline */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.8 }}
            className="font-space-mono text-[11px] md:text-[13px] leading-relaxed tracking-[0.16em] md:tracking-[0.24em] uppercase"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            {t("hero.tagline")}{" "}
            <span style={{ color: "rgb(var(--shaft-cream-dim))" }}>
              {t("hero.tagline2")}
            </span>
          </motion.p>

          {/* Episode marker */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.95 }}
            className="mt-6 md:mt-8 flex items-center gap-3"
          >
            <div
              className="w-1.5 h-1.5 shrink-0"
              style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
            />
            <span
              className="font-space-mono text-[10px] md:text-[11px] leading-relaxed tracking-[0.14em] md:tracking-[0.2em] uppercase max-w-2xl"
              style={{ color: "rgb(var(--shaft-muted))" }}
            >
              {t("hero.marker")}
            </span>
          </motion.div>

          {/* Primary routes: inspect the work or start a conversation. */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 1.1 }}
            className="mt-8 md:mt-10 flex flex-wrap items-center gap-3 relative z-20"
          >
            <button
              onClick={() => {
                playSound("click");
                document.getElementById("shaft-archive")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="shaft-control group flex items-center border px-5 py-3 transition-colors text-[rgb(var(--shaft-cream))] hover:bg-[rgb(var(--shaft-cream))] hover:text-[rgb(var(--shaft-bg))]"
              style={{ borderColor: "rgb(var(--shaft-cream))" }}
            >
              <span className="font-space-mono text-[10px] tracking-[0.24em] uppercase">{t("hero.viewWork")}</span>
              <span className="ml-4 transition-transform group-hover:translate-x-1">↓</span>
            </button>
            <button
              onClick={() => {
                playSound("click");
                document.getElementById("shaft-call")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="shaft-control group flex items-center border px-5 py-3 transition-colors hover:bg-[rgb(var(--shaft-crimson))]"
              style={{ borderColor: "rgb(var(--shaft-crimson))", color: "rgb(var(--shaft-cream))" }}
            >
              <span className="font-space-mono text-[10px] tracking-[0.24em] uppercase"><ShaftDecipher text={t("hero.cta")} /></span>
              <span className="ml-4 text-[rgb(var(--shaft-crimson))] transition-all group-hover:translate-x-1 group-hover:text-[rgb(var(--shaft-cream))]">→</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 1.3 }}
        onClick={scrollToNext}
        className="absolute bottom-6 md:bottom-8 left-6 md:left-16 lg:left-24 flex items-center gap-4 group z-20"
        aria-label="Scroll down"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10"
          style={{ backgroundColor: "rgb(var(--shaft-border))" }}
        />
        <span
          className="font-space-mono text-[7px] md:text-[8px] tracking-[0.35em] uppercase"
          style={{ color: "rgb(var(--shaft-muted))" }}
        >
          <ShaftDecipher text={t("hero.scroll")} />
        </span>
      </motion.button>
    </section>
  );
}
