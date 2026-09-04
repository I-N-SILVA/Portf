"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { routes } from "@/lib/routes";
import styles from "./StudioNav.module.css";

const LINKS: [label: string, id: string][] = [
  ["Work", "work"],
  ["Services", "services"],
  ["Process", "process"],
  ["FAQ", "faq"],
];

export default function StudioNavLinks() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const onLanding = pathname === routes.studio.root;
  const [active, setActive] = useState(onLanding ? "work" : "");

  useEffect(() => {
    if (!onLanding) return;
    const sections = LINKS.map(([, id]) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-24% 0px -64% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [onLanding]);

  return (
    <nav className={styles.navPill} aria-label="Studio sections">
      {LINKS.map(([label, id]) => {
        const isActive = onLanding && active === id;
        return (
          <Link
            key={id}
            href={`${routes.studio.root}#${id}`}
            aria-current={isActive ? "location" : undefined}
            className={styles.navItem}
          >
            {isActive && (
              <motion.span
                layoutId="studio-nav-marker"
                className={styles.navMarker}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden="true"
              />
            )}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
