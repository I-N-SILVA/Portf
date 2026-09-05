"use client";

import WorkflowOperator from "@/components/brand/WorkflowOperator";
import BrandMark from "@/components/brand/BrandMark";
import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AVAILABILITY, studioHero } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import styles from "./StudioHero.module.css";

const WORKFLOWS = [
  {
    name: "Operations",
    stages: [
      ["Input", "New request arrives"],
      ["AI assist", "Classify and route"],
      ["Human review", "Owner approves exception"],
      ["Output", "Record and team updated"],
    ],
  },
  {
    name: "Support",
    stages: [
      ["Input", "Shared inbox message"],
      ["AI assist", "Retrieve context + draft"],
      ["Human review", "Team reviews response"],
      ["Output", "Reply sent and logged"],
    ],
  },
  {
    name: "Reporting",
    stages: [
      ["Input", "Approved source data"],
      ["AI assist", "Validate and summarise"],
      ["Human review", "Analyst checks the brief"],
      ["Output", "Weekly report delivered"],
    ],
  },
] as const;

const COLLAGE = [
  { src: "/projects/ai-agents.webp", alt: "AI agent project interface", className: styles.cardLeft },
  { src: "/hero-portrait.webp", alt: "Portrait of Ian N. Silva", className: styles.cardPortrait },
  { src: "/projects/stocksnap.png", alt: "StockSnap project interface", className: styles.cardRight },
] as const;

export default function StudioHero() {
  const [workflowIndex, setWorkflowIndex] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const workflow = WORKFLOWS[workflowIndex];

  function chooseWorkflow(index: number) {
    setWorkflowIndex(index);
    setActiveStage(0);
  }

  function stepWorkflow(direction: -1 | 1) {
    chooseWorkflow((workflowIndex + direction + WORKFLOWS.length) % WORKFLOWS.length);
  }

  return (
    <section className={styles.wrap} aria-labelledby="studio-heading">
      <div className={styles.poster}>
        <span className={`${styles.registration} ${styles.regOne}`} aria-hidden="true">+</span>
        <span className={`${styles.registration} ${styles.regTwo}`} aria-hidden="true">+</span>
        <span className={`${styles.registration} ${styles.regThree}`} aria-hidden="true">+</span>
        <span className={`${styles.registration} ${styles.regFour}`} aria-hidden="true">+</span>
        <div className={styles.redSlab} aria-hidden="true" />

        <div className={styles.topline}>
          <p>Independent AI consultant</p>
          <p className={styles.availability}><span />{AVAILABILITY}</p>
          <p>London · Working worldwide</p>
        </div>

        <div className={styles.titleStage}>
          <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => stepWorkflow(-1)} aria-label="Previous workflow example">
            <ArrowLeft aria-hidden="true" />
          </button>
          <h1 id="studio-heading" className={styles.title} aria-label="AI that earns its place in your workflow.">
            <span aria-hidden="true" className={styles.solid}>AI THAT<span className={styles.mobileBreak}> EARNS</span></span>
            <span aria-hidden="true" className={styles.offset} data-text="ITS PLACE IN">ITS PLACE<span className={styles.mobileBreak}> IN</span></span>
            <span aria-hidden="true" className={styles.outline}>YOUR<span className={styles.mobileBreak}> WORK<span className={styles.mobileBreak}>FLOW.</span></span></span>
          </h1>
          <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => stepWorkflow(1)} aria-label="Next workflow example">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <div className={styles.introRow}>
          <p className={styles.intro}>{studioHero.body}</p>
          <div className={styles.actions}>
            <Link href={routes.studio.section("contact")} className={styles.primaryAction}>
              {studioHero.primaryCta}<ArrowRight aria-hidden="true" />
            </Link>
            <Link href={routes.studio.section("work")} className={styles.secondaryAction}>See the work</Link>
          </div>
        </div>

        <div className={styles.workflow}>
          <div className={styles.workflowHead}>
            <p><span>Live example</span> Move through the line</p>
            <div className={styles.workflowTabs} role="group" aria-label="Example workflow">
              {WORKFLOWS.map((item, index) => (
                <button key={item.name} type="button" aria-pressed={workflowIndex === index} onClick={() => chooseWorkflow(index)}>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.rail} style={{ "--progress": `${activeStage / 3}` } as CSSProperties}>
            <span className={styles.railBase} aria-hidden="true" />
            <span className={styles.railProgress} aria-hidden="true" />
            {workflow.stages.map(([label, value], index) => (
              <button
                key={`${workflow.name}-${label}`}
                type="button"
                className={styles.stage}
                aria-pressed={activeStage === index}
                onPointerEnter={() => setActiveStage(index)}
                onFocus={() => setActiveStage(index)}
                onClick={() => setActiveStage(index)}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.stageNumber}>0{index + 1}</span>
                <span className={styles.stageLabel}>{label}</span>
                <span className={styles.stageValue}>{value}</span>
              </button>
            ))}
          </div>
          <WorkflowOperator stage={activeStage} workflow={workflow.name} />
          <p className={styles.disclaimer}>Illustrative pattern · every control is designed around the people doing the work</p>
        </div>

        <div className={styles.collage} aria-label="Selected work and portrait">
          <div className={styles.collageDisc} aria-hidden="true"><span>DIAGNOSE · PROVE · EMBED ·</span></div>
          {COLLAGE.map((item) => (
            <div key={item.src} className={`${styles.imageCard} ${item.className}`}>
              <Image src={item.src} alt={item.alt} fill sizes="(max-width: 700px) 44vw, 280px" className="object-cover" />
            </div>
          ))}
          <div className={styles.redCard} aria-hidden="true"><BrandMark size={116} /><small>Ian Silva<br />Useful by design</small></div>
        </div>

        <div className={styles.bottomline}>
          <p>Ian N. Silva</p>
          <p>Strategy · Systems · Handover</p>
          <Link href={routes.portal}>Client portal <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
