"use client";

import { motion } from "framer-motion";

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
  return (
    <section
      id="shaft-domains"
      className="relative py-28 overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
    >
      {/* Watermark */}
      <div
        aria-hidden="true"
        className="absolute left-0 bottom-0 font-playfair font-black leading-none pointer-events-none select-none"
        style={{
          fontSize: "clamp(120px, 22vw, 320px)",
          color: "rgb(8 8 8)",
          lineHeight: 1,
        }}
      >
        04
      </div>

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
            04 / CORE DOMAINS
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
        </motion.div>

        {/* Asymmetric panel grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-px"
          style={{ backgroundColor: "rgb(var(--shaft-border))" }}
        >
          {/* ── Large left panel (spans 2 cols) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-2 group relative overflow-hidden"
            style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
          >
            <div className="p-10 md:p-14 flex flex-col min-h-[320px] md:min-h-[380px] justify-between">
              <div>
                {/* Number */}
                <span
                  className="font-playfair font-black leading-none block mb-6"
                  style={{
                    fontSize: "clamp(48px, 6vw, 80px)",
                    color: "rgb(var(--shaft-border))",
                  }}
                >
                  {domains[0].num}
                </span>

                <h3
                  className="font-playfair font-black leading-tight mb-5"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 48px)",
                    color: "rgb(var(--shaft-cream))",
                  }}
                >
                  {domains[0].title}
                </h3>

                <p
                  className="text-base leading-relaxed"
                  style={{
                    color: "rgb(var(--shaft-cream-dim))",
                    maxWidth: "480px",
                  }}
                >
                  {domains[0].body}
                </p>
              </div>

              {/* Growing crimson accent line */}
              <div
                className="h-px mt-8 transition-all duration-500 group-hover:opacity-100"
                style={{
                  width: "40px",
                  backgroundColor: "rgb(var(--shaft-crimson))",
                  opacity: 0.5,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.width = "90px";
                  (e.currentTarget as HTMLDivElement).style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.width = "40px";
                  (e.currentTarget as HTMLDivElement).style.opacity = "0.5";
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
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.2, delay: 0.1 + i * 0.1 }}
                className="group relative p-8 flex flex-col justify-between"
                style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
              >
                <div>
                  <span
                    className="font-playfair font-black leading-none block mb-5"
                    style={{
                      fontSize: "clamp(28px, 3vw, 40px)",
                      color: "rgb(var(--shaft-border))",
                    }}
                  >
                    {domain.num}
                  </span>

                  <h3
                    className="font-playfair font-black leading-tight mb-3"
                    style={{
                      fontSize: "clamp(16px, 1.6vw, 22px)",
                      color: "rgb(var(--shaft-cream))",
                    }}
                  >
                    {domain.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgb(var(--shaft-cream-dim))" }}
                  >
                    {domain.body}
                  </p>
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
