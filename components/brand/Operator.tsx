"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useBrandMotion } from "./BrandMotion";
import styles from "./Brand.module.css";

export default function Operator({ pose = "idle", size = 240, playKey = 0, label, priority = false }: {
  pose?: "idle" | "runner"; size?: number; playKey?: number | string; label?: string; priority?: boolean;
}) {
  const { enabled } = useBrandMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect(); }
    }, { threshold: .2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} className={styles.operator} style={{ width: size, maxWidth: "100%" }}>
    <span key={playKey} className={`${styles.actor} ${enabled && seen ? (pose === "runner" ? styles.run : styles.arrive) : ""}`}>
      <Image src={`/brand/operator-${pose}.webp`} alt={label ?? ""} width={720} height={720}
        sizes={`(max-width: 600px) 50vw, ${size}px`} priority={priority} className={styles.operatorImage} />
    </span>
  </span>;
}
