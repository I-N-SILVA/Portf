"use client";

import { useEffect, useState } from "react";

/**
 * The "opening session" moment — shown once per browser session, then the
 * app is revealed. Honours prefers-reduced-motion (near-instant).
 */
export function BootGate({ label = "opening session" }: { label?: string }) {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("shaft-booted") === "1") {
      setGone(true);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => setDone(true), reduce ? 200 : 1500);
    const t2 = setTimeout(() => {
      setGone(true);
      sessionStorage.setItem("shaft-booted", "1");
    }, reduce ? 500 : 2050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="os-boot" data-done={done} aria-hidden="true">
      <div className="os-boot-mark">Shaft</div>
      <div className="os-boot-rule" />
      <div className="os-boot-cap">{label}</div>
    </div>
  );
}
