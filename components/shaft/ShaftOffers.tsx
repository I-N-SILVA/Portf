"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "@/lib/i18n";

export default function ShaftOffers() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const offers = [
    { num: "01", title: t("offers.1.title"), body1: t("offers.1.body1"), body2: t("offers.1.body2") },
    { num: "02", title: t("offers.2.title"), body1: t("offers.2.body1"), body2: t("offers.2.body2") },
    { num: "03", title: t("offers.3.title"), body1: t("offers.3.body1"), body2: t("offers.3.body2") },
  ];

  return (
    <section
      ref={sectionRef}
      id="shaft-offers"
      className="relative py-28 overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      {/* Watermark — parallax + Glitch */}
      <motion.div
        aria-hidden="true"
        className="absolute right-0 top-20 font-playfair font-black leading-none pointer-events-none select-none shaft-glitch"
        style={{
          fontSize: "clamp(120px, 22vw, 320px)",
          // Was a hardcoded rgb(8 8 8): correct against the dark ground and a
          // solid black slab on the parchment theme. --shaft-surface is the
          // one-step-off-the-background token, so it stays a watermark in
          // both.
          color: "rgb(var(--shaft-surface))",
          lineHeight: 1,
          y: watermarkY,
        }}
      >
        03
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
            {t("offers.section")}
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

        {/* Header Block */}
        <div className="mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-playfair font-black leading-[0.9] tracking-tight mb-8"
            style={{
              color: "rgb(var(--shaft-cream))",
              fontSize: "clamp(48px, 6vw, 84px)",
              maxWidth: "800px"
            }}
          >
            {t("offers.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-space-mono text-[10px] md:text-[12px] tracking-[0.2em] uppercase"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            {t("offers.subtitle")}
          </motion.p>
        </div>

        {/*
          A drawer of catalogue slips rather than three stacked essays.

          The old form was one full-width prose block per offer, which meant
          the three could only be compared by scrolling between them — and
          they exist to be compared. Side by side with the same four parts in
          the same order (index, title, what it is, who it is for), the
          comparison is the layout. The punch at the foot of each slip is the
          detail that makes it a card and not a box.
        */}
        <div className="grid gap-px md:grid-cols-3" style={{ backgroundColor: "rgb(var(--shaft-border))" }}>
          {offers.map((offer, i) => (
            <motion.article
              key={offer.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
              className="group relative flex flex-col p-8 lg:p-10"
              style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
            >
              {/* Filing rule — drawn on hover, and always on for touch. */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-0.5 w-0 transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full"
                style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
              />

              <div className="flex items-baseline gap-4">
                <span
                  className="font-space-mono text-[10px] tracking-[0.3em]"
                  style={{ color: "rgb(var(--shaft-crimson-text))" }}
                >
                  [ {offer.num} ]
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1"
                  style={{ backgroundColor: "rgb(var(--shaft-border))" }}
                />
              </div>

              <h3
                className="mt-6 font-playfair font-black leading-[1.06]"
                style={{
                  fontSize: "clamp(22px, 2vw, 30px)",
                  color: "rgb(var(--shaft-cream))",
                }}
              >
                {offer.title}
              </h3>

              <p
                className="mt-5 text-[15px] leading-relaxed"
                style={{ color: "rgb(var(--shaft-cream-dim))" }}
              >
                {offer.body1}
              </p>

              <p
                className="mt-auto pt-8 text-[12px] leading-relaxed"
                style={{ color: "rgb(var(--shaft-muted))" }}
              >
                {offer.body2}
              </p>

              {/* The punch: what makes a catalogue card a catalogue card. */}
              <span
                aria-hidden="true"
                className="mx-auto mt-8 block h-2.5 w-2.5 rounded-full border"
                style={{ borderColor: "rgb(var(--shaft-border))" }}
              />
            </motion.article>
          ))}
        </div>

        {/* CTA Under Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 md:mt-24 max-w-xl"
        >
          <div className="h-px w-16 mb-8" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
          <p className="font-playfair text-xl md:text-2xl leading-snug" style={{ color: "rgb(var(--shaft-cream))" }}>
            {t("offers.cta")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
