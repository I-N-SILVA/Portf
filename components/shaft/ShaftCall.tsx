"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import CalendarBooking from "@/components/CalendarBooking";
import { socialLinks } from "@/lib/placeholder-content";

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
  const [showBooking, setShowBooking] = useState(false);

  return (
    <section
      id="shaft-call"
      className="relative overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      {/* ── Primary theatrical CTA ── */}
      <div className="relative min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-28">

        {/* Background geometry */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Watermark */}
          <div
            aria-hidden="true"
            className="absolute left-0 bottom-0 font-playfair font-black leading-none pointer-events-none select-none"
            style={{
              fontSize: "clamp(120px, 22vw, 320px)",
              color: "rgb(16 16 16)",
              lineHeight: 1,
            }}
          >
            05
          </div>

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
            05 / THE CALL
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
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
            SCHEDULE
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
            THE CALL.
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
              { text: "30 minutes.", dim: true },
              { text: "No pitch.",   dim: true },
              { text: "Just a real conversation.", dim: false },
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
            <button
              onClick={() => setShowBooking((v) => !v)}
              className="group w-full flex items-center justify-between border transition-colors duration-150 focus:outline-none"
              style={{
                borderColor: "rgb(var(--shaft-crimson))",
                backgroundColor: showBooking ? "rgb(204 17 34)" : "transparent",
              }}
              aria-expanded={showBooking}
            >
              <span
                className="font-space-mono text-[10px] md:text-[11px] tracking-[0.5em] uppercase px-8 py-5 border-r transition-colors duration-150"
                style={{
                  color: showBooking ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-cream))",
                  borderColor: "rgb(var(--shaft-crimson))",
                }}
              >
                {showBooking ? "[ CLOSE BOOKING ]" : "[ BOOK A SESSION"}
              </span>
              <motion.span
                animate={{ x: showBooking ? 0 : [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: showBooking ? 0 : Infinity, ease: "easeInOut" }}
                className="font-space-mono text-[13px] px-6 py-5"
                style={{ color: showBooking ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-crimson))" }}
              >
                {showBooking ? "×" : "→ ]"}
              </motion.span>
            </button>
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
              or reach directly —
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
            FIN.
          </span>
        </div>
      </div>

      {/* ── Expandable calendar booking ── */}
      <AnimatePresence initial={false}>
        {showBooking && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
            style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
          >
            <div className="px-8 md:px-16 lg:px-24 py-16">
              {/* Calendar intertitle */}
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px w-10 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
                <span
                  className="font-space-mono text-[8px] tracking-[0.55em] uppercase"
                  style={{ color: "rgb(var(--shaft-gold))" }}
                >
                  SELECT A SLOT
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
              </div>

              <div className="max-w-4xl mx-auto">
                <CalendarBooking />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            © {new Date().getFullYear()} IAN N. SILVA — ALL RIGHTS RESERVED
          </span>

          {/* Social links as text */}
          <div className="flex flex-wrap items-center gap-6">
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
