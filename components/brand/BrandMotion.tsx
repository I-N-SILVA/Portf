"use client";

import { createContext, useContext, useEffect, useState } from "react";
import styles from "./Brand.module.css";

const MotionContext = createContext({ enabled: false, toggle: () => {}, reduced: false });

export function BrandMotionProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    try { setPaused(localStorage.getItem("silva-motion") === "paused"); } catch { /* Storage may be unavailable. */ }
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const toggle = () => setPaused(value => {
    try { localStorage.setItem("silva-motion", value ? "enabled" : "paused"); } catch { /* Preference still applies this visit. */ }
    return !value;
  });
  const enabled = !paused && !reduced;
  return <MotionContext.Provider value={{ enabled, toggle, reduced }}>
    <div data-brand-motion={enabled ? "on" : "off"}>{children}</div>
  </MotionContext.Provider>;
}

export function useBrandMotion() { return useContext(MotionContext); }

export function MotionToggle() {
  const { enabled, toggle, reduced } = useBrandMotion();
  return <button type="button" className={styles.motionToggle} onClick={toggle} disabled={reduced}
    aria-pressed={!enabled} aria-label={reduced ? "Animations disabled by your system preference" : "Pause animations"}>
    <span aria-hidden="true">{enabled ? "Ⅱ" : "▷"}</span>
    {reduced ? "Reduced motion" : enabled ? "Motion on" : "Motion off"}
  </button>;
}
