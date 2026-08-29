"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The intertitle that opens every block of the dossier:
 *
 *     ──  [ 02 ]  CAPABILITIES  ───────────────────────────────
 *
 * The same device the portfolio uses between sections, kept because it is
 * the thing that makes a page read as a numbered record rather than a
 * stack of marketing panels. The trailing rule draws itself in on scroll.
 */
export default function StudioMark({
  num,
  label,
  tone = "day",
}: {
  num: string;
  label: string;
  /** `night` inverts the hairlines for the dark cover and closing panels. */
  tone?: "day" | "night";
}) {
  const reduceMotion = useReducedMotion();
  const rule = tone === "night" ? "var(--st-night-border)" : "var(--st-border)";

  return (
    <div className="mb-8 flex items-center gap-4 md:mb-10">
      <span
        className="h-px w-8 shrink-0"
        style={{ backgroundColor: "var(--st-accent)" }}
      />
      <span
        className="st-label st-accent-mark shrink-0 tabular-nums"
        style={{ color: "var(--st-accent)" }}
      >
        [ {num} ]
      </span>
      <span className="st-label shrink-0">{label}</span>
      <motion.span
        aria-hidden="true"
        className="h-px flex-1 origin-left"
        style={{ backgroundColor: rule }}
        initial={reduceMotion ? undefined : { scaleX: 0 }}
        whileInView={reduceMotion ? undefined : { scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
