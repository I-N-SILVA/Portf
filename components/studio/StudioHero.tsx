"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AVAILABILITY } from "@/lib/client-content";
import { routes } from "@/lib/routes";

const LINE = "I build the systems that give your team its hours back.";

/**
 * The cover sheet.
 *
 * A dossier opens on a black card before the paper starts, which is what
 * lets this page quote the portfolio's ground without spending the whole
 * scroll in the dark. It is one screen and it ends — the parchment edge is
 * visible underneath it, so nobody has to guess whether there is more.
 *
 * The only motion is a parallax drift on the watermark and a staggered
 * word reveal on the statement: enough that the page feels alive under the
 * scroll, cheap enough that it never competes with reading it.
 */
export default function StudioHero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const markY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);

  const words = LINE.split(" ");

  return (
    <section
      ref={ref}
      className="st-night st-grid relative overflow-hidden"
      // `position` is set inline as well as by the class: useScroll measures
      // the target as soon as it mounts, and in dev the stylesheet is
      // injected by the bundler after hydration — so framer-motion sees a
      // static element and warns that it cannot compute a scroll offset.
      style={{ position: "relative", borderBottom: "1px solid var(--st-night-border)" }}
    >
      {/* Watermark — the section number, set as a print artefact. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-4 select-none font-black leading-none md:right-4"
        style={{
          fontFamily: "var(--st-serif)",
          fontSize: "clamp(180px, 30vw, 460px)",
          color: "var(--st-night-alt)",
          y: reduceMotion ? 0 : markY,
        }}
      >
        01
      </motion.span>

      {/* A single crimson rule bleeding off the left edge — the one place on
          this page that still uses the reel's accent rather than the
          portal's blue, marking the hand-off between the two. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-px"
        style={{ backgroundColor: "var(--st-crimson)", opacity: 0.5 }}
      />

      <motion.div
        style={{ opacity: reduceMotion ? 1 : fade }}
        className="relative z-10 mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-between px-6 py-10 md:px-10 md:py-14"
      >
        {/* ── file header ── */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b pb-4"
          style={{ borderColor: "var(--st-night-border)" }}
        >
          {/* No inline colour — .st-night .st-label carries the gold that
              actually clears AA against this ground. */}
          <span className="st-label">Dossier / Studio</span>
          <span className="st-meta">Ian N. Silva</span>
          <span className="st-meta ml-auto hidden sm:inline">
            AI Automation &amp; Product
          </span>
        </div>

        {/* ── statement ── */}
        <div className="py-12 md:py-16">
          <h1
            className="max-w-[16ch] font-black tracking-tight"
            style={{
              fontFamily: "var(--st-serif)",
              fontSize: "clamp(40px, 7.2vw, 92px)",
              lineHeight: 0.98,
            }}
          >
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="st-rise inline-block will-change-transform"
                style={{ animationDelay: `${0.1 + i * 0.045}s` }}
              >
                {word}
                {i < words.length - 1 && " "}
              </span>
            ))}
          </h1>

          <p
            className="st-rise mt-8 max-w-xl text-base leading-relaxed md:text-lg"
            style={{ color: "var(--st-night-dim)", animationDelay: "0.55s" }}
          >
            AI automation, internal tools and web products — designed around
            your workflow, prototyped in days, and handed over as yours.
          </p>

          <div
            className="st-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ animationDelay: "0.7s" }}
          >
            <Link
              href={routes.studio.section("contact")}
              className="st-label border px-6 py-4 transition-colors"
              style={{
                color: "var(--st-night-ink)",
                borderColor: "var(--st-night-ink)",
              }}
            >
              Start a project →
            </Link>
            <Link
              href={routes.studio.section("work")}
              className="st-label st-underline st-underline-grow py-4"
              style={{ color: "var(--st-night-ink)" }}
            >
              See the work
            </Link>
            <span className="st-stamp ml-auto">{AVAILABILITY}</span>
          </div>
        </div>

        {/* ── footer rule ── */}
        <div
          className="flex items-end justify-between border-t pt-4"
          style={{ borderColor: "var(--st-night-border)" }}
        >
          <span className="st-meta">Solo studio · Remote · Worldwide</span>
          <span className="st-meta hidden md:inline">Scroll ↓</span>
        </div>
      </motion.div>
    </section>
  );
}
