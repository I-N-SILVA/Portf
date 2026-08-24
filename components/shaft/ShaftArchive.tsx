"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { projects } from "@/lib/placeholder-content";
import { useTranslation } from "@/lib/i18n";
import Image from "next/image";
import ShaftRedact from "./ShaftRedact";

/* Map project IDs to generated images */
const PROJECT_IMAGES: Record<string, string> = {
  "11": "/projects/terminal-dj.png",
  "10": "/projects/muski.png",
  "9": "/projects/notchy.png",
  "8": "/projects/ai-agents.png",
};

/**
 * Retired projects keep their records for the studio case studies that point
 * at them (see Project.retired), but they are off the portfolio.
 */
const SHOWN = projects.filter((p) => !p.retired);

/**
 * Derived from what is actually on the list rather than hardcoded, so a
 * filter can never be a dead end. The old fixed list still offered WEB3 after
 * the last WEB3 project went, and picking it rendered nothing at all — the
 * section has no empty state, so the rules just closed on blank space.
 */
const CATEGORIES = [
  "ALL",
  ...Array.from(new Set(SHOWN.map((p) => p.category.toUpperCase()))).sort(),
];

export default function ShaftArchive() {
  const [filter, setFilter]     = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hovered, setHovered]   = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const filtered = SHOWN.filter(
    (p) => filter === "ALL" || p.category.toUpperCase() === filter
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
          color: "rgb(16 16 16)",
          lineHeight: 1,
          y: watermarkY,
        }}
      >
        04
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
          <div className="h-px w-10 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
          <span className="font-space-mono text-[8px] tracking-[0.55em] uppercase" style={{ color: "rgb(var(--shaft-gold))" }}>
            {t("archive.section")}
          </span>
          <motion.div 
            className="h-px flex-1 origin-left" 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
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
              onClick={() => { setFilter(cat); setExpanded(null); }}
              className="relative font-space-mono text-[9px] tracking-[0.45em] uppercase transition-all duration-100 pb-1"
              style={{ color: filter === cat ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-muted))" }}
            >
              {cat}
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

        {/* Dossier list */}
        <div>
          {filtered.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.25) }}
              onMouseEnter={() => setHovered(project.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Rule */}
              <div className="h-px" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />

              {/* Entry row */}
              <button
                className="w-full text-left group py-5 focus:outline-none"
                onClick={() => {
                  const isExpanding = expanded !== project.id;
                  if (isExpanding) {
                    window.dispatchEvent(new CustomEvent("shaft-flash"));
                  }
                  setExpanded(expanded === project.id ? null : project.id);
                }}
                aria-expanded={expanded === project.id}
              >
                <div className="flex items-start justify-between gap-6">

                  {/* Left: case number + title */}
                  <div className="flex items-baseline gap-5 min-w-0 flex-1">
                    <span
                      className="font-space-mono text-[8px] tracking-[0.2em] uppercase shrink-0"
                      style={{ color: "rgb(var(--shaft-muted))" }}
                    >
                      CASE_{String(index + 1).padStart(3, "0")}
                    </span>
                    <h3
                      className="font-playfair font-bold truncate transition-colors duration-100"
                      style={{
                        fontSize: "clamp(18px, 2.2vw, 30px)",
                        color: expanded === project.id
                          ? "rgb(var(--shaft-crimson))"
                          : "rgb(var(--shaft-cream))",
                      }}
                    >
                      {t(`projects.${project.id}.title`)}
                    </h3>
                  </div>

                  {/* Right: badge + category + toggle */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden lg:flex items-center gap-3 mr-4">
                      <ShaftRedact
                        text={project.role}
                        className="text-[7px] tracking-[0.1em]"
                        revealed={hovered === project.id || expanded === project.id}
                      />
                    </div>
                    {project.badge && (
                      <span
                        className="font-space-mono text-[7px] tracking-[0.3em] uppercase border px-2 py-0.5 hidden sm:inline"
                        style={{
                          color: "rgb(var(--shaft-gold))",
                          borderColor: "rgb(var(--shaft-gold) / 0.5)",
                        }}
                      >
                        {project.badge}
                      </span>
                    )}
                    <span
                      className="font-space-mono text-[8px] tracking-[0.25em] uppercase hidden md:inline"
                      style={{ color: "rgb(var(--shaft-muted))" }}
                    >
                      {project.category}
                    </span>
                    <motion.span
                      animate={{ rotate: expanded === project.id ? 45 : 0 }}
                      transition={{ duration: 0.12 }}
                      className="font-space-mono text-lg leading-none"
                      style={{ color: "rgb(var(--shaft-muted))" }}
                    >
                      +
                    </motion.span>
                  </div>
                </div>

                {/* Tag row */}
                <div className="flex flex-wrap items-center gap-4 mt-2 pl-[calc(1.5rem+1.25rem+1.25rem)]">
                  {project.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="font-space-mono text-[7px] tracking-[0.2em] uppercase"
                      style={{ color: "rgb(var(--shaft-border) / 0.8)", filter: "brightness(1.8)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>

              {/* Expanded intel panel */}
              <AnimatePresence initial={false}>
                {expanded === project.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mb-6 ml-[calc(1.5rem+1.25rem+1.25rem)] border-l-2 pl-6 py-2"
                      style={{ borderColor: "rgb(var(--shaft-crimson))" }}
                    >
                      <p
                        className="text-sm leading-relaxed mb-5"
                        style={{ color: "rgb(var(--shaft-cream-dim))" }}
                      >
                        {t(`projects.${project.id}.full`)}
                      </p>

                      {/* ── Cinematic project image ── */}
                      {PROJECT_IMAGES[project.id] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className="relative overflow-hidden mb-6 group/img"
                          style={{ maxHeight: "280px" }}
                        >
                          <Image
                            src={PROJECT_IMAGES[project.id]}
                            alt={project.title}
                            width={800}
                            height={400}
                            // `group-hover` never fires on a touch screen, so every project image
                            // stayed grey forever on a phone. The arbitrary variant restores
                            // colour wherever hover does not exist.
                            className="w-full h-auto object-cover grayscale group-hover/img:grayscale-0 [@media(hover:none)]:grayscale-0 transition-all duration-700"
                            style={{ opacity: 0.7 }}
                          />
                          {/* Scanline overlay */}
                          <div className="absolute inset-0 shaft-scanline opacity-30 pointer-events-none" />
                          {/* Gradient fade at bottom */}
                          <div
                            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                            style={{ background: "linear-gradient(to top, rgb(var(--shaft-bg)), transparent)" }}
                          />
                        </motion.div>
                      )}

                      {project.features && project.features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-5">
                          {project.features.slice(0, 4).map((feat) => (
                            <div key={feat} className="flex items-start gap-2">
                              <span
                                className="font-space-mono text-[10px] shrink-0 mt-px"
                                style={{ color: "rgb(var(--shaft-crimson))" }}
                              >
                                —
                              </span>
                              <span
                                className="font-space-mono text-[8px] tracking-[0.15em] leading-relaxed"
                                style={{ color: "rgb(var(--shaft-muted))" }}
                              >
                                {feat}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6">
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-space-mono text-[8px] tracking-[0.35em] uppercase border-b pb-0.5 transition-opacity hover:opacity-70"
                            style={{
                              color: "rgb(var(--shaft-cream))",
                              borderColor: "rgb(var(--shaft-crimson))",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t("archive.viewProject")}
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-space-mono text-[8px] tracking-[0.35em] uppercase transition-opacity hover:opacity-70"
                            style={{ color: "rgb(var(--shaft-muted))" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t("archive.source")}
                          </a>
                        )}
                        <div className="flex items-center gap-2">
                          <ShaftRedact
                            text={project.role}
                            className="text-[8px] tracking-[0.2em] uppercase"
                            revealed={hovered === project.id || expanded === project.id}
                          />
                          <span style={{ color: "rgb(var(--shaft-muted))" }}>·</span>
                          <ShaftRedact
                            text={project.duration}
                            className="text-[8px] tracking-[0.2em] uppercase"
                            revealed={hovered === project.id || expanded === project.id}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Bottom rule */}
          <div className="h-px" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
        </div>
      </div>
    </section>
  );
}
