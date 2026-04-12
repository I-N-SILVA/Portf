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
          color: "rgb(8 8 8)",
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

        {/* Offers list */}
        <div className="flex flex-col gap-px" style={{ backgroundColor: "rgb(var(--shaft-border))" }}>
          {offers.map((offer, i) => (
             <motion.div
               key={offer.num}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-60px" }}
               transition={{ duration: 0.4, delay: 0.1 * i }}
               className="group relative p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-24 items-start"
               style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
             >
               {/* Number */}
               <div className="overflow-hidden flex-shrink-0">
                  <motion.span
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="font-playfair font-black leading-none block"
                    style={{
                      fontSize: "clamp(32px, 4vw, 56px)",
                      color: "rgb(var(--shaft-border))",
                    }}
                  >
                    {offer.num}
                  </motion.span>
               </div>

               {/* Content */}
               <div className="max-w-2xl">
                 <div className="overflow-hidden mb-5">
                   <motion.h3
                     initial={{ y: "100%" }}
                     whileInView={{ y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                     className="font-playfair font-black leading-tight"
                     style={{
                       fontSize: "clamp(24px, 2.5vw, 36px)",
                       color: "rgb(var(--shaft-cream))",
                     }}
                   >
                     {offer.title}
                   </motion.h3>
                 </div>

                 <motion.div
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                   className="space-y-4"
                 >
                   <p className="text-base lg:text-lg leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                     {offer.body1}
                   </p>
                   <p className="text-sm lg:text-base leading-relaxed italic" style={{ color: "rgb(var(--shaft-muted))" }}>
                     {offer.body2}
                   </p>
                 </motion.div>
               </div>
               
               {/* Accent line */}
               <div
                 className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-700 ease-in-out group-hover:w-full"
                 style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
               />
             </motion.div>
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
