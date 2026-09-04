"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Braces, Check, Database, UserCheck } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { AVAILABILITY, studioHero } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import styles from "./StudioHero.module.css";

const WORKFLOWS = [
  {
    name: "Operations",
    input: "New request arrives",
    assist: "Classify and route",
    review: "Owner approves exception",
    output: "Record and team updated",
  },
  {
    name: "Support",
    input: "Shared inbox message",
    assist: "Retrieve context + draft",
    review: "Team reviews response",
    output: "Reply sent and logged",
  },
  {
    name: "Reporting",
    input: "Approved source data",
    assist: "Validate and summarise",
    review: "Analyst checks the brief",
    output: "Weekly report delivered",
  },
] as const;

const NODES = [
  { key: "input", label: "01 / Input", icon: Database },
  { key: "assist", label: "02 / AI assist", icon: Bot },
  { key: "review", label: "03 / Human review", icon: UserCheck },
  { key: "output", label: "04 / Output", icon: Check },
] as const;

export default function StudioHero() {
  const [selected, setSelected] = useState(0);
  const section = useRef<HTMLElement>(null);
  const spotlightBounds = useRef<DOMRect | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 38]);
  const visualRotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -1.8]);
  const workflow = WORKFLOWS[selected];

  function prepareSpotlight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reduceMotion) return;
    spotlightBounds.current = event.currentTarget.getBoundingClientRect();
  }

  function moveSpotlight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reduceMotion) return;
    const box = spotlightBounds.current ?? event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
  }

  return (
    <section
      ref={section}
      className="mx-auto max-w-[1280px] px-3 pb-20 pt-3 sm:px-6 sm:pt-6 md:pb-28"
      aria-labelledby="studio-heading"
    >
      <div
        className={styles.hero}
        onPointerEnter={prepareSpotlight}
        onPointerMove={moveSpotlight}
        onPointerLeave={() => { spotlightBounds.current = null; }}
        style={{ "--spot-x": "76%", "--spot-y": "38%" } as CSSProperties}
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="flex flex-col justify-between px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:min-h-[720px] lg:px-16 lg:py-20">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-space-mono text-[10px] uppercase tracking-[0.28em] text-stone-400 sm:text-xs">
                  {studioHero.eyebrow}
                </p>
                <span className="flex items-center gap-2 border border-emerald-700/60 bg-emerald-950/50 px-3 py-1 font-space-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {AVAILABILITY}
                </span>
              </div>
              <h1 id="studio-heading" className="mt-8 max-w-4xl text-balance font-playfair text-4xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-5xl md:text-7xl">
                {studioHero.heading}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-stone-300 sm:text-lg">
                {studioHero.body}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={routes.studio.section("contact")} className="group flex min-h-12 items-center justify-center gap-2 bg-stone-50 px-6 text-sm font-semibold text-stone-950 transition-colors hover:bg-emerald-300 focus-visible:!outline-emerald-300">
                  {studioHero.primaryCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href={routes.studio.section("work")} className="flex min-h-12 items-center justify-center border border-stone-600 px-6 text-sm font-medium text-stone-200 transition-colors hover:border-stone-200 hover:text-white focus-visible:!outline-emerald-300">
                  See applied work
                </Link>
              </div>
            </div>

            <ol className="mt-14 grid gap-px border border-stone-800 bg-stone-800 sm:grid-cols-3 lg:mt-10">
              {studioHero.workingModel.map((item, index) => (
                <li key={item.title} className="bg-[#10110e] p-4">
                  <span className="font-space-mono text-[9px] text-emerald-400">0{index + 1}</span>
                  <p className="mt-3 text-sm font-semibold text-stone-100">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="border-t border-stone-800 p-5 sm:p-8 lg:border-l lg:border-t-0 lg:py-14" aria-label="Illustrative AI workflow">
            <motion.div style={{ y: visualY, rotateX: visualRotate }} className={styles.canvas}>
              <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-stone-800 pb-4">
                  <div>
                    <p className="font-space-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400">Consulting canvas</p>
                    <p className="mt-1 text-sm font-medium text-stone-200">Human-controlled workflow</p>
                  </div>
                  <Braces className="h-5 w-5 text-stone-600" aria-hidden="true" />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Example workflow">
                  {WORKFLOWS.map((item, index) => (
                    <button key={item.name} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`${styles.tab} font-space-mono text-[9px] uppercase tracking-[0.1em] ${selected === index ? styles.tabActive : ""}`}>
                      {item.name}
                    </button>
                  ))}
                </div>

                <div className="mt-6" aria-live="polite" aria-atomic="true">
                  <motion.div
                    key={workflow.name}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
                  >
                    {NODES.map((node, index) => {
                      const Icon = node.icon;
                      return (
                        <div key={node.key}>
                          <div className={styles.node}>
                            <span className={styles.nodeIcon}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                            <span>
                              <span className="block font-space-mono text-[8px] uppercase tracking-[0.16em] text-stone-500">{node.label}</span>
                              <span className="mt-1 block text-xs font-medium text-stone-200">{workflow[node.key]}</span>
                            </span>
                          </div>
                          {index < NODES.length - 1 && <div className={styles.connector} aria-hidden="true"><span className={styles.pulse} /></div>}
                        </div>
                      );
                    })}
                  </motion.div>
                </div>

                <p className="mt-auto border-t border-stone-800 pt-4 font-space-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-stone-500">
                  Illustrative pattern · final controls are designed around your team
                </p>
              </div>
            </motion.div>
            <Link href={routes.portal} className="mt-5 inline-flex items-center gap-2 font-space-mono text-[10px] uppercase tracking-[0.16em] text-stone-400 underline decoration-stone-700 underline-offset-4 hover:text-emerald-300 focus-visible:!outline-emerald-300">
              Existing client? Open portal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
