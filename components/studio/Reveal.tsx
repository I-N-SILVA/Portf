"use client";

import { ReactNode, useEffect, useRef } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = element.current;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node || motionPreference.matches) return;

    let animation: Animation | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        animation = node.animate(
          [
            { opacity: 0.38, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 560,
            delay: delay * 1000,
            easing: "cubic-bezier(.21,.47,.32,.98)",
            fill: "none",
          },
        );
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12%", threshold: 0.08 },
    );

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer.disconnect();
      animation?.cancel();
    };

    observer.observe(node);
    motionPreference.addEventListener("change", handleMotionPreference);
    return () => {
      observer.disconnect();
      animation?.cancel();
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, [delay]);

  return (
    <div
      ref={element}
      className={className}
    >
      {children}
    </div>
  );
}
