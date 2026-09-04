"use client";

import { useId, useState } from "react";
import { CONTACT_FORM, services } from "@/lib/client-content";
import styles from "./EngagementFinder.module.css";

const startingPoints = [
  {
    label: "Exploring AI",
    context: "You want to know where it could help.",
    projectType: CONTACT_FORM.PROJECT_TYPES[1],
    recommendation: services[0].title,
    description:
      "Look at the work first. We can map the friction, assess the opportunities, and choose a useful first experiment.",
    bring:
      "A recurring task, the tools your team uses, and what you would like to improve.",
  },
  {
    label: "One clear workflow",
    context: "You have a specific process in mind.",
    projectType: CONTACT_FORM.PROJECT_TYPES[2],
    recommendation: services[1].title,
    description:
      "Turn the use case into a focused pilot, with real examples, review steps, and a clear way to judge its output.",
    bring:
      "An example input and output, the people involved, and any steps that need approval.",
  },
  {
    label: "A working prototype",
    context: "You want to put it into everyday use.",
    projectType: CONTACT_FORM.PROJECT_TYPES[3],
    recommendation: services[2].title,
    description:
      "Review what works, identify what production needs, and plan the build, documentation, and handover around your team.",
    bring:
      "A demo or description of the prototype, its current limits, and who will run it.",
  },
] as const;

export default function EngagementFinder() {
  const [selected, setSelected] = useState(0);
  const headingId = useId();
  const resultId = useId();
  const current = startingPoints[selected];

  return (
    <section className={styles.finder} aria-labelledby={headingId}>
      <div className={styles.intro}>
        <p className={`${styles.eyebrow} font-space-mono`}>A place to begin</p>
        <h3 id={headingId} className={`${styles.heading} font-playfair`}>
          Where are you starting?
        </h3>
        <p className={styles.introCopy}>
          Choose the closest fit. We can refine the brief together.
        </p>
      </div>

      <div className={styles.workspace}>
        <div
          className={styles.choices}
          role="group"
          aria-label="Your starting point"
        >
          {startingPoints.map((point, index) => (
            <button
              key={point.label}
              type="button"
              className={styles.choice}
              aria-pressed={selected === index}
              aria-controls={resultId}
              onClick={() => setSelected(index)}
            >
              <span
                className={`${styles.number} font-space-mono`}
                aria-hidden="true"
              >
                0{index + 1}
              </span>
              <span className={styles.choiceText}>
                <span className={styles.choiceLabel}>{point.label}</span>
                <span className={styles.choiceContext}>{point.context}</span>
              </span>
              <span className={styles.indicator} aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="m4 8 3 3 5-6" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        <div
          id={resultId}
          className={styles.result}
          aria-live="polite"
          aria-atomic="true"
        >
          <div key={current.label} className={styles.resultContent}>
            <p className={`${styles.eyebrow} font-space-mono`}>
              Suggested starting point
            </p>
            <h4 className={`${styles.recommendation} font-playfair`}>
              {current.recommendation}
            </h4>
            <p className={styles.description}>{current.description}</p>
            <div className={styles.bring}>
              <p className={`${styles.bringLabel} font-space-mono`}>
                Bring to the conversation
              </p>
              <p>{current.bring}</p>
            </div>
            {/* A document navigation lets the contact form read its initial query. */}
            <a
              className={styles.cta}
              href={`/studio?projectType=${encodeURIComponent(current.projectType)}#contact`}
            >
              Discuss this starting point
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m-5-5 5 5-5 5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
