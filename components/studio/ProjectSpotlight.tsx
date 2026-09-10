"use client";

import type { PointerEvent, ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./ProjectSpotlight.module.css";

export default function ProjectSpotlight({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  function moveLight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--light-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--light-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <div className={styles.surface} onPointerMove={moveLight}>
      {children}
      <span className={styles.light} aria-hidden="true" />
    </div>
  );
}
