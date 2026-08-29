"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/lib/routes";

const LINKS: [label: string, id: string][] = [
  ["Work", "work"],
  ["Approach", "approach"],
  ["Terms", "terms"],
];

export default function StudioNavLinks() {
  const pathname = usePathname();
  const onLanding = pathname === routes.studio.root;
  const [active, setActive] = useState("");

  useEffect(() => {
    if (!onLanding) return;

    const sections = LINKS.map(([, id]) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );

    // Treat the section crossing the middle third of the viewport as active.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onLanding]);

  return (
    <>
      {LINKS.map(([label, id]) => {
        const isActive = onLanding && active === id;
        return (
          <Link
            key={id}
            href={`${routes.studio.root}#${id}`}
            aria-current={isActive ? "true" : undefined}
            className={`st-label st-underline hidden min-[560px]:block ${
              isActive ? "" : "st-underline-grow"
            }`}
            style={{
              color: isActive ? "var(--st-night-ink)" : "var(--st-night-dim)",
            }}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
