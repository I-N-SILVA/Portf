"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "@/lib/i18n";

const domains = [
  {
    num: "I.",
    title: "AI AUTONOMY",
    body: "Building intelligent agents and workflows that perceive, reason, and execute complex operations autonomously. MCP integrations, multi-agent systems, LLM orchestration — the full stack.",
    wide: true,
  },
  {
    num: "II.",
    title: "BEHAVIORAL DESIGN",
    body: "Applying behavioral economics to architect user experiences that naturally drive engagement and conversion.",
    wide: false,
  },
  {
    num: "III.",
    title: "FULL-STACK SYSTEMS",
    body: "Engineering robust, scalable architectures — high-performance frontends, secure cloud infrastructure, clean APIs.",
    wide: false,
  },
];

export default function ShaftDomains() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const domains = [
    { num: "I.", title: t("domains.1.title"), body: t("domains.1.body"), wide: true },
    { num: "II.", title: t("domains.2.title"), body: t("domains.2.body"), wide: false },
    { num: "III.", title: t("domains.3.title"), body: t("domains.3.body"), wide: false },
  ];

  return (
    <section
      ref={sectionRef}
      id="shaft-domains"
      className="relative py-28 overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
    >
      {/* Watermark — parallax + Glitch */}
      <motion.div
        aria-hidden="true"
        className="absolute left-0 bottom-0 font-playfair font-black leading-none pointer-events-none select-none shaft-glitch"
        style={{
          fontSize: "clamp(120px, 22vw, 320px)",
          color: "rgb(8 8 8)",
          lineHeight: 1,
          y: watermarkY,
        }}
      >
        05
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
            {t("domains.section")}
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

        {/* Asymmetric panel grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-px"
          style={{ backgroundColor: "rgb(var(--shaft-border))" }}
        >
          {/* ── Large left panel (spans 2 cols) ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 group relative overflow-hidden"
            style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
          >
            <div className="p-10 md:p-14 flex flex-col min-h-[320px] md:min-h-[380px] justify-between">
              <div>
                {/* Number with kinetic reveal */}
                <div className="overflow-hidden mb-6">
                  <motion.span
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="font-playfair font-black leading-none block"
                    style={{
                      fontSize: "clamp(48px, 6vw, 80px)",
                      color: "rgb(var(--shaft-border))",
                    }}
                  >
                    {domains[0].num}
                  </motion.span>
                </div>

                <div className="overflow-hidden mb-5">
                  <motion.h3
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="font-playfair font-black leading-tight"
                    style={{
                      fontSize: "clamp(28px, 3.5vw, 48px)",
                      color: "rgb(var(--shaft-cream))",
                    }}
                  >
                    {domains[0].title}
                  </motion.h3>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-base leading-relaxed"
                  style={{
                    color: "rgb(var(--shaft-cream-dim))",
                    maxWidth: "480px",
                  }}
                >
                  {domains[0].body}
                </motion.p>
              </div>

              {/* Growing crimson accent line */}
              <div
                className="h-px mt-8 transition-all duration-500 group-hover:opacity-100"
                style={{
                  width: "40px",
                  backgroundColor: "rgb(var(--shaft-crimson))",
                  opacity: 0.5,
                }}
              />
            </div>

            {/* Corner annotation */}
            <span
              className="absolute top-6 right-8 font-space-mono text-[8px] tracking-[0.3em] uppercase"
              style={{ color: "rgb(var(--shaft-muted) / 0.4)" }}
            >
              PRIMARY
            </span>
          </motion.div>

          {/* ── Right column — 2 stacked panels ── */}
          <div
            className="grid grid-rows-2 gap-px"
            style={{ backgroundColor: "rgb(var(--shaft-border))" }}
          >
            {domains.slice(1).map((domain, i) => (
              <motion.div
                key={domain.num}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className="group relative p-8 flex flex-col justify-between"
                style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
              >
                <div>
                  <div className="overflow-hidden mb-5">
                    <motion.span
                      initial={{ y: "100%" }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                      className="font-playfair font-black leading-none block"
                      style={{
                        fontSize: "clamp(28px, 3vw, 40px)",
                        color: "rgb(var(--shaft-border))",
                      }}
                    >
                      {domain.num}
                    </motion.span>
                  </div>

                  <div className="overflow-hidden mb-3">
                    <motion.h3
                      initial={{ y: "100%" }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                      className="font-playfair font-black leading-tight"
                      style={{
                        fontSize: "clamp(16px, 1.6vw, 22px)",
                        color: "rgb(var(--shaft-cream))",
                      }}
                    >
                      {domain.title}
                    </motion.h3>
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                    className="text-sm leading-relaxed"
                    style={{ color: "rgb(var(--shaft-cream-dim))" }}
                  >
                    {domain.body}
                  </motion.p>
                </div>

                {/* Accent */}
                <div
                  className="h-px mt-6 transition-all duration-300"
                  style={{
                    width: "24px",
                    backgroundColor: "rgb(var(--shaft-crimson))",
                  }}
                />

                {/* Corner annotation */}
                <span
                  className="absolute top-4 right-5 font-space-mono text-[7px] tracking-[0.25em] uppercase"
                  style={{ color: "rgb(var(--shaft-muted) / 0.3)" }}
                >
                  {String(i + 2).padStart(2, "0")}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
