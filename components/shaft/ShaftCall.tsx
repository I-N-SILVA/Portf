"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { socialLinks } from "@/lib/placeholder-content";
import { useTranslation } from "@/lib/i18n";
import { ShaftGatewayLinks } from "./ShaftGateway";

// Minimal social icon labels for text-only rendering
const SOCIAL_LABELS: Record<string, string> = {
  instagram: "INSTAGRAM",
  youtube:   "YOUTUBE",
  linkedin:  "LINKEDIN",
  github:    "GITHUB",
  substack:  "SUBSTACK",
};

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] } },
});

const vpOpts = { once: true, margin: "-60px" };

export default function ShaftCall() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section
      ref={sectionRef}
      id="shaft-call"
      className="relative overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      {/* ── Primary theatrical CTA ── */}
      <div className="relative min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-28">

        {/* Background geometry */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Watermark — parallax */}
          <motion.div
            aria-hidden="true"
            className="absolute left-0 bottom-0 font-playfair font-black leading-none pointer-events-none select-none"
            style={{
              fontSize: "clamp(120px, 22vw, 320px)",
              color: "rgb(16 16 16)",
              lineHeight: 1,
              y: watermarkY,
            }}
          >
            05
          </motion.div>

          {/* Faint crimson horizontal stripe */}
          <div
            className="absolute top-1/2 left-0 right-0 h-px"
            style={{ backgroundColor: "rgb(204 17 34 / 0.08)" }}
          />
        </div>

        {/* Section intertitle */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={vpOpts}
          className="flex items-center gap-4 mb-14 relative z-10"
        >
          <div className="h-px w-10 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
          <span className="font-space-mono text-[8px] tracking-[0.55em] uppercase" style={{ color: "rgb(var(--shaft-gold))" }}>
            {t("call.section")}
          </span>
          <motion.div 
            className="h-px flex-1 origin-left" 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={vpOpts}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: "rgb(var(--shaft-border))" }} 
          />
        </motion.div>

        <div className="relative z-10">
          {/* Title block */}
          <motion.h2
            className="font-playfair font-black leading-[0.85] tracking-tighter"
            style={{
              color: "rgb(var(--shaft-cream))",
              fontSize: "clamp(56px, 11vw, 160px)",
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("call.title1")}
          </motion.h2>

          {/* Crimson rule */}
          <motion.div
            className="h-0.5 w-full my-2 origin-left"
            style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: 0.15 }}
          />

          <motion.h2
            className="font-playfair font-black leading-[0.85] tracking-tighter"
            style={{
              color: "rgb(var(--shaft-cream))",
              fontSize: "clamp(56px, 11vw, 160px)",
              marginLeft: "3vw",
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("call.title2")}
          </motion.h2>

          {/* Dialogue text — sparse, pause-heavy */}
          <motion.div
            variants={fadeUp(0.4)}
            initial="hidden"
            whileInView="visible"
            viewport={vpOpts}
            className="mt-12 space-y-1"
          >
            {[
              { text: t("call.line1"), dim: true },
              { text: t("call.line2"),   dim: true },
              { text: t("call.line3"), dim: false },
            ].map(({ text, dim }) => (
              <p
                key={text}
                className="font-playfair text-xl md:text-2xl"
                style={{ color: dim ? "rgb(var(--shaft-muted))" : "rgb(var(--shaft-cream-dim))" }}
              >
                {text}
              </p>
            ))}
          </motion.div>

          {/* CTA — full-width rectangular placard */}
          <motion.div
            variants={fadeUp(0.6)}
            initial="hidden"
            whileInView="visible"
            viewport={vpOpts}
            className="mt-12"
          >
            <a
              href="https://calendly.com/iansilva-plyaz/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full flex items-center justify-between border transition-colors duration-150 hover:bg-[rgb(204_17_34)] "
              style={{
                borderColor: "rgb(var(--shaft-crimson))",
                backgroundColor: "transparent",
              }}
            >
              <span
                className="font-space-mono text-[10px] md:text-[11px] tracking-[0.5em] uppercase px-8 py-5 border-r transition-colors duration-150"
                style={{
                  color: "rgb(var(--shaft-cream))",
                  borderColor: "rgb(var(--shaft-crimson))",
                }}
              >
                {t("call.cta.open")}
              </span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="font-space-mono text-[13px] px-6 py-5"
                style={{ color: "rgb(var(--shaft-crimson))" }}
              >
                → ]
              </motion.span>
            </a>
          </motion.div>

          {/* Email fallback */}
          <motion.div
            variants={fadeUp(0.75)}
            initial="hidden"
            whileInView="visible"
            viewport={vpOpts}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <span
              className="font-space-mono text-[8px] tracking-[0.3em] uppercase"
              style={{ color: "rgb(var(--shaft-muted))" }}
            >
              {t("call.email.prefix")}
            </span>
            <a
              href="mailto:iannogueira@proton.me"
              className="font-space-mono text-[8px] tracking-[0.3em] uppercase border-b pb-0.5 transition-opacity hover:opacity-70"
              style={{
                color: "rgb(var(--shaft-cream-dim))",
                borderColor: "rgb(var(--shaft-border))",
              }}
            >
              iannogueira@proton.me
            </a>
          </motion.div>
        </div>

        {/* FIN. marker */}
        <div className="absolute bottom-10 right-8 md:right-16 lg:right-24 pointer-events-none">
          <span
            className="font-playfair text-sm font-bold italic"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            {t("call.fin")}
          </span>
        </div>
      </div>



      {/* ── Footer / Credits ── */}
      <footer
        className="border-t px-8 md:px-16 lg:px-24 py-8"
        style={{ borderColor: "rgb(var(--shaft-border))" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Copyright */}
          <span
            className="font-space-mono text-[8px] tracking-[0.35em] uppercase"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            © {new Date().getFullYear()} IAN N. SILVA — {t("call.copyright")}
          </span>

          {/* Social links as text */}
          <div className="flex flex-wrap items-center gap-6">
            <ShaftGatewayLinks />
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-space-mono text-[7px] tracking-[0.35em] uppercase transition-colors hover:opacity-100"
                style={{ color: "rgb(var(--shaft-muted))", opacity: 0.5 }}
              >
                {SOCIAL_LABELS[link.icon] || link.name.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </section>
  );
}
