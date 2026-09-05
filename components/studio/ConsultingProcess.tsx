"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, FileText, GitBranch, ShieldCheck } from "lucide-react";
import styles from "./ConsultingProcess.module.css";

const stages = [
  {
    title: "Diagnose",
    question: "Where will a better system make a difference?",
    body: "We map how the work moves today: the inputs, decisions, handoffs, and exceptions. Then we choose one useful problem and agree how to judge the result.",
    deliverable: "Workflow map + a focused brief",
    artifact: "01 / Opportunity map",
  },
  {
    title: "Prove",
    question: "Does it work with the messy, everyday inputs?",
    body: "A small, working prototype puts the idea in your team's hands. We test representative cases, define where human review belongs, and make the limits visible before building further.",
    deliverable: "Working prototype + evaluation notes",
    artifact: "02 / Evaluation plan",
  },
  {
    title: "Embed",
    question: "Can your team confidently run it tomorrow?",
    body: "We connect the system to the tools you use, document the operating steps, and walk through the handover. Ownership, monitoring, and the next iteration are clear from the start.",
    deliverable: "Deployed system + a practical runbook",
    artifact: "03 / Handover pack",
  },
];

function ProcessArtifact({ stage }: { stage: number }) {
  return (
    <div className={styles.artifact} aria-hidden="true">
      <div className={`${styles.artifactBar} font-space-mono`}>
        <span>{stages[stage].artifact}</span>
        <span className={styles.windowDots}><i /><i /><i /></span>
      </div>
      <div className={styles.artifactBody}>
        {stage === 0 && (
          <div className={styles.workflow}>
            <div className={`${styles.smallLabel} font-space-mono`}>Make the handoffs visible</div>
            <div className={styles.workflowNode}><FileText size={18} /><span>Incoming work<small>Forms, files, messages</small></span></div>
            <ArrowDown className={styles.connector} size={22} />
            <div className={`${styles.workflowNode} ${styles.emphasisNode}`}><GitBranch size={18} /><span>Understand & route<small>Rules, context, exceptions</small></span></div>
            <div className={styles.fork}><span /><span /></div>
            <div className={styles.branchNodes}><div>Clear case<small>Continue workflow</small></div><div>Needs judgement<small>Human review</small></div></div>
          </div>
        )}
        {stage === 1 && (
          <div className={styles.evaluation}>
            <div className={`${styles.smallLabel} font-space-mono`}>Define the bar before the build</div>
            <h4>Useful. Reliable.<br />Understood.</h4>
            {[
              ["Real inputs", "Representative everyday cases"],
              ["Clear boundaries", "Exceptions and review points"],
              ["Shared decision", "What to ship, change, or stop"],
            ].map(([title, detail]) => (
              <div className={styles.evaluationRow} key={title}><span className={styles.checkBox}><Check size={13} /></span><span>{title}<small>{detail}</small></span></div>
            ))}
            <p className={`${styles.artifactNote} font-space-mono`}>A test plan, not a promise of perfection.</p>
          </div>
        )}
        {stage === 2 && (
          <div className={styles.handover}>
            <div className={styles.documentCover}><div className={`${styles.smallLabel} font-space-mono`}>Your team / Your system</div><ShieldCheck size={28} strokeWidth={1.3} /><h4>The operating<br />manual.</h4></div>
            <div className={styles.documentList}>{["How it works", "When to intervene", "Access & ownership", "Monitor & improve"].map((line, index) => <div key={line}><span className="font-space-mono">0{index + 1}</span>{line}<ArrowUpRight size={13} /></div>)}</div>
          </div>
        )}
      </div>
      <div className={`${styles.artifactFooter} font-space-mono`}><span className={styles.statusDot} />Illustrative consulting artifact</div>
    </div>
  );
}

export default function ConsultingProcess() {
  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      if (preference.matches || !window.IntersectionObserver) return;
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) =>
              Math.abs(a.boundingClientRect.top - window.innerHeight * 0.45) -
              Math.abs(b.boundingClientRect.top - window.innerHeight * 0.45),
            );
          if (visible[0]) {
            setActiveStage(Number((visible[0].target as HTMLElement).dataset.stage));
          }
        },
        { rootMargin: "-28% 0px -38% 0px", threshold: 0 },
      );
      stageRefs.current.forEach((element) => element && observer?.observe(element));
    };
    observe();
    preference.addEventListener("change", observe);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", observe);
    };
  }, []);

  return (
    <section id="process" className={styles.section} aria-labelledby="consulting-process-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={`${styles.eyebrow} font-space-mono`}>The engagement / 01 — 03</p>
          <h2 id="consulting-process-title">From opportunity to<br className={styles.desktopBreak} /> a working system.</h2>
          <p>A practical path from an open question to something your team can use and own.</p>
        </div>
        <div className={styles.layout}>
          <div className={styles.stickyColumn}>
            <div className={styles.stickyPanel}>
              <div className={styles.artifactStack}>
                {stages.map((stage, index) => (
                  <div className={styles.artifactLayer} data-active={index === activeStage} key={stage.title}><ProcessArtifact stage={index} /></div>
                ))}
              </div>
              <div className={`${styles.progress} font-space-mono`} aria-hidden="true">
                {stages.map((stage, index) => <span key={stage.title} data-active={index === activeStage}>0{index + 1}<i />{stage.title}</span>)}
              </div>
            </div>
          </div>
          <div className={styles.stages}>
            {stages.map((stage, index) => (
              <div className={styles.stage} key={stage.title} data-stage={index} data-active={index === activeStage} ref={(element) => { stageRefs.current[index] = element; }}>
                <div className={`${styles.stageNumber} font-space-mono`}>0{index + 1}</div>
                <div className={styles.stageCopy}>
                  <h3>{stage.title}</h3>
                  <p className={styles.question}>{stage.question}</p>
                  <p className={styles.body}>{stage.body}</p>
                  <div className={styles.deliverable}><ArrowUpRight size={16} aria-hidden="true" /><p><span className="font-space-mono">You leave with</span>{stage.deliverable}</p></div>
                </div>
                <div className={styles.inlineArtifact}><ProcessArtifact stage={index} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
