"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { profileData } from "@/lib/placeholder-content";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const metaItems = [
  { label: "BACKGROUND",    value: "BSc Economics · MSc Psychology",  accent: false },
  { label: "LOCATION",      value: profileData.location,              accent: false },
  { label: "CURRENT FOCUS", value: "AI Agents · MCP · Automation",    accent: false },
  { label: "STATUS",        value: "Accepting new projects — Q4 2026", accent: true  },
];

export default function ShaftIdentity() {
  const sectionRef = useRef<HTMLElement>(null);
  const { playSound } = useSoundEffects();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section
      ref={sectionRef}
      id="shaft-identity"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden py-28"
      style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
    >
      {/* Background watermark number — parallax + Glitch */}
      <motion.div
        aria-hidden="true"
        onViewportEnter={() => playSound("glitch")}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute right-0 bottom-0 font-playfair font-black leading-none pointer-events-none select-none shaft-glitch"
        style={{
          fontSize: "clamp(120px, 22vw, 320px)",
          color: "rgb(8 8 8)",
          lineHeight: 1,
          y: watermarkY,
        }}
      >
        02
      </motion.div>

      {/* ── Section intertitle ── */}
      <div className="px-8 md:px-16 lg:px-24 mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-4"
        >
          <div
            className="h-px w-10 shrink-0"
            style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
          />
          <span
            className="font-space-mono text-[8px] tracking-[0.55em] uppercase"
            style={{ color: "rgb(var(--shaft-gold))" }}
          >
            02 / IDENTITY
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
      </div>

      <div className="px-8 md:px-16 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-28">

          {/* ── Left: Monologue with Kinetic Reveal ── */}
          <div>
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="font-space-mono text-[10px] tracking-[0.35em] uppercase mb-10"
              style={{ color: "rgb(var(--shaft-crimson))" }}
            >
              {"// 02"}
            </motion.div>

            {/* Kinetic Lines */}
            {[
              { text: "The question isn't", indent: false },
              { text: "what I build.",       indent: true  },
              { text: "",                    indent: false },
              { text: "It's what breaks",    indent: false },
              { text: "without me.",         indent: true  },
            ].map((line, i) =>
              line.text === "" ? (
                <div key={i} className="h-8" />
              ) : (
                <div key={i} className="overflow-hidden">
                  <motion.p
                    custom={0.1 + i * 0.08}
                    initial={{ y: "100%", opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="font-playfair font-black leading-[1.0] tracking-tight"
                    style={{
                      fontSize: "clamp(28px, 4.5vw, 56px)",
                      color: "rgb(var(--shaft-cream))",
                      marginLeft: line.indent ? "1.8rem" : 0,
                    }}
                  >
                    {line.text}
                  </motion.p>
                </div>
              )
            )}

            {/* Thin separator */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: 0.5 }}
              className="h-px w-4/5 my-10 origin-left"
              style={{ backgroundColor: "rgb(var(--shaft-border))" }}
            />

            {/* Bio with slower reveal */}
            <motion.p
              custom={0.55}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base leading-relaxed"
              style={{ color: "rgb(var(--shaft-cream-dim))" }}
            >
              {profileData.bio}
            </motion.p>
          </div>

          {/* ── Right: Metadata dossier ── */}
          <div className="flex flex-col gap-0">
            {metaItems.map((item, i) => (
              <motion.div
                key={item.label}
                custom={0.2 + i * 0.09}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="border-b py-6 flex items-start justify-between gap-4"
                style={{ borderColor: "rgb(var(--shaft-border))" }}
              >
                <div className="flex-1">
                  <p
                    className="font-space-mono text-[8px] tracking-[0.4em] uppercase mb-3"
                    style={{ color: "rgb(var(--shaft-muted))" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="font-playfair text-xl md:text-2xl font-bold leading-snug"
                    style={{
                      color: item.accent
                        ? "rgb(var(--shaft-cream))"
                        : "rgb(var(--shaft-cream-dim))",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
                {/* Accent mark */}
                {item.accent && (
                  <div
                    className="w-1.5 h-1.5 mt-1 shrink-0"
                    style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                  />
                )}
              </motion.div>
            ))}

            {/* Availability pulse */}
            <motion.div
              custom={0.6}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex items-center gap-3 pt-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span
                className="font-space-mono text-[9px] tracking-[0.3em] uppercase"
                style={{ color: "rgb(var(--shaft-muted))" }}
              >
                Available for collaboration
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
