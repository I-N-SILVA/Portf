"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { portfolioProjects } from "@/lib/placeholder-content";
import { useTranslation } from "@/lib/i18n";
import ShaftWorkGallery from "./ShaftWorkGallery";

/**
 * Derived from what is actually on the list rather than hardcoded, so a
 * filter can never be a dead end. The old fixed list still offered WEB3 after
 * the last WEB3 project went, and picking it rendered nothing at all — the
 * section has no empty state, so the rules just closed on blank space.
 */
const CATEGORIES = [
  "ALL",
  ...Array.from(
    new Set(portfolioProjects.map((p) => p.category.toUpperCase())),
  ).sort(),
];

export default function ShaftArchive() {
  const [filter, setFilter] = useState("ALL");
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const filtered = portfolioProjects.filter(
    (p) => filter === "ALL" || p.category.toUpperCase() === filter,
  );

  return (
    <section
      ref={sectionRef}
      id="shaft-archive"
      className="relative py-28 overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      {/* Background watermark — parallax */}
      <motion.div
        aria-hidden="true"
        className="absolute right-0 top-0 font-playfair font-black leading-none pointer-events-none select-none"
        style={{
          fontSize: "clamp(120px, 22vw, 320px)",
          // Same hardcoded near-black as the other two watermarks: a
          // watermark on the dark ground, a solid slab on parchment.
          color: "rgb(var(--shaft-surface))",
          lineHeight: 1,
          y: watermarkY,
        }}
      >
        02
      </motion.div>

      <div className="px-8 md:px-16 lg:px-24 relative z-10">
        {/* Section intertitle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-4 mb-14"
        >
          <div
            className="h-px w-10 shrink-0"
            style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
          />
          <h2
            className="font-space-mono text-[9px] tracking-[0.55em] uppercase"
            style={{ color: "rgb(var(--shaft-gold))" }}
          >
            {t("archive.section")}
          </h2>
          <motion.div
            className="h-px flex-1 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ backgroundColor: "rgb(var(--shaft-border))" }}
          />
        </motion.div>

        {/* Category filters — text links, not pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-8 mb-12"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="relative font-space-mono text-[9px] tracking-[0.45em] uppercase transition-all duration-100 pb-1"
              style={{
                color:
                  filter === cat
                    ? "rgb(var(--shaft-cream))"
                    : "rgb(var(--shaft-muted))",
              }}
            >
              {cat === "ALL" ? t("archive.filter.all") : cat}
              {filter === cat && (
                <motion.div
                  layoutId="arch-underline"
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                  transition={{ type: "spring", stiffness: 500, damping: 45 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/*
          One gallery, not a carousel followed by an accordion of the same
          records. The two showed identical projects in two different
          interaction models, so reaching a project's detail meant scrolling
          past a reel that had just shown it — and neither view answered
          "what is this and did it ship" without a second click.
        */}
        <ShaftWorkGallery projects={filtered} />
      </div>
    </section>
  );
}
