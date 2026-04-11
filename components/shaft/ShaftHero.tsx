"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTranslation } from "@/lib/i18n";
import ShaftDecipher from "./ShaftDecipher";
import Image from "next/image";

export default function ShaftHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { playSound } = useSoundEffects();
  const { t } = useTranslation();
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

      {/* ── Background geometry & Video Window ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Large watermark number — parallax */}
        <motion.div
          className="absolute right-[4%] top-1/2 -translate-y-1/2 font-playfair font-black leading-none select-none shaft-glitch"
          style={{
            fontSize: "clamp(160px, 28vw, 380px)",
            color: "rgb(20 20 20)",
            userSelect: "none",
            y: watermarkY,
            x: useTransform(springX, (v) => v * -0.5),
          }}
          aria-hidden="true"
        >
          01
        </motion.div>

        {/* Geometric frame group — parallax at half rate */}
        <motion.div
          className="absolute inset-0 hidden md:block"
          style={{ y: frameY }}
          aria-hidden="true"
        >
          {/* Main Video "Window" Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onAnimationComplete={() => playSound("shutter")}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute right-[10%] top-[20%] w-[40vw] h-[65vh] group overflow-hidden border border-white/5"
            style={{ 
              x: useTransform(springX, (v) => v * 0.8),
              y: useTransform(springY, (v) => v * 0.8),
            }}
          >
            <Image
              src="/hero-portrait.png"
              alt="Hero"
              fill
              className="absolute inset-0 w-full h-full object-contain opacity-90 drop-shadow-2xl transition-all duration-1000 group-hover:scale-105"
            />
            
            {/* Inner frame scanline specifically for the video */}
            <div className="absolute inset-0 shaft-scanline opacity-20" />
          </motion.div>

          {/* Rectangular secondary frame */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.9 }}
            className="absolute right-[8%] top-[18%] hidden md:block"
            style={{
              width: "16vw",
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
              right: "7%",
              top: "17.5%",
              width: "18vw",
              height: "1px",
              backgroundColor: "rgb(var(--shaft-crimson))",
              transform: "rotate(1.5deg)",
              transformOrigin: "left center",
              x: useTransform(springX, (v) => v * 1.2),
            }}
          />

          {/* Thin horizontal rule at bottom of frame */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.4 }}
            transition={{ duration: 0.35, delay: 1.15 }}
            className="absolute hidden md:block"
            style={{
              right: "7%",
              top: "67%",
              width: "18vw",
              height: "1px",
              backgroundColor: "rgb(var(--shaft-border))",
              x: useTransform(springX, (v) => v * 0.9),
            }}
          />
        </motion.div>
      </div>

      {/* ── Scene marker — top right ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, delay: 0.35 }}
        className="absolute top-8 right-8 font-space-mono text-[9px] tracking-[0.45em] uppercase z-20"
        style={{ color: "rgb(var(--shaft-muted))" }}
      >
        {t("hero.scene")}
      </motion.div>

      {/* ── Main content — left-biased ── */}
      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
        <div style={{ maxWidth: "62%" }}>

          {/* Pre-title annotation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, delay: 0.15 }}
            className="font-space-mono text-[9px] tracking-[0.4em] uppercase mb-6"
            style={{ color: "rgb(var(--shaft-crimson))" }}
          >
            {t("hero.pretitle")}
          </motion.div>

          {/* Name — staggered lines */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-playfair font-black leading-[0.83] tracking-tighter"
              style={{
                color: "rgb(var(--shaft-cream))",
                fontSize: "clamp(72px, 13vw, 200px)",
              }}
              initial={{ y: "108%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.38, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              IAN N.
            </motion.h1>
          </div>

          <div className="overflow-hidden" style={{ marginLeft: "3vw" }}>
            <motion.h1
              className="font-playfair font-black leading-[0.83] tracking-tighter"
              style={{
                color: "rgb(var(--shaft-cream))",
                fontSize: "clamp(72px, 13vw, 200px)",
              }}
              initial={{ y: "108%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.38, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              SILVA.
            </motion.h1>
          </div>

          {/* Separator */}
          <motion.div
            className="h-px w-full mt-8 mb-6 origin-left"
            style={{ backgroundColor: "rgb(var(--shaft-border))" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.35, delay: 0.5 }}
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.6 }}
            className="font-space-mono text-[10px] md:text-[12px] tracking-[0.35em] uppercase"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            {t("hero.tagline")}{" "}
            <span style={{ color: "rgb(var(--shaft-cream-dim))" }}>
              {t("hero.tagline2")}
            </span>
          </motion.p>

          {/* Episode marker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.8 }}
            className="mt-8 flex items-center gap-3"
          >
            <div
              className="w-1.5 h-1.5 shrink-0"
              style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
            />
            <span
              className="font-space-mono text-[9px] tracking-[0.25em] uppercase"
              style={{ color: "rgb(var(--shaft-muted))" }}
            >
              {t("hero.marker")}
            </span>
          </motion.div>

          {/* Primary CTA — scroll to The Call */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 1.0 }}
            onClick={() => {
              playSound("click");
              document.getElementById("shaft-call")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mt-10 group flex items-center gap-0 border transition-all duration-150 relative z-20"
            style={{
              borderColor: "rgb(var(--shaft-crimson))",
              backgroundColor: "transparent",
            }}
            whileHover={{ backgroundColor: "rgb(204 17 34 / 0.08)" }}
          >
            <span
              className="font-space-mono text-[9px] tracking-[0.45em] uppercase px-6 py-3 border-r"
              style={{
                color: "rgb(var(--shaft-cream))",
                borderColor: "rgb(var(--shaft-crimson))",
              }}
            >
              <ShaftDecipher text={t("hero.cta")} />
            </span>
            <span
              className="font-space-mono text-[11px] px-4 py-3 transition-transform duration-150 group-hover:translate-x-1"
              style={{ color: "rgb(var(--shaft-crimson))" }}
            >
              →
            </span>
          </motion.button>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 1.2 }}
        onClick={scrollToNext}
        className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center gap-4 group z-20"
        aria-label="Scroll down"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10"
          style={{ backgroundColor: "rgb(var(--shaft-border))" }}
        />
        <span
          className="font-space-mono text-[8px] tracking-[0.35em] uppercase"
          style={{ color: "rgb(var(--shaft-muted))" }}
        >
          <ShaftDecipher text={t("hero.scroll")} />
        </span>
      </motion.button>
    </section>
  );
}
