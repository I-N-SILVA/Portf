"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTranslation, LOCALES } from "@/lib/i18n";
import ShaftDecipher from "./ShaftDecipher";

const chapters = [
  { id: "shaft-hero",     key: "nav.opening",  num: "01" },
  { id: "shaft-identity", key: "nav.identity", num: "02" },
  { id: "shaft-archive",  key: "nav.archive",  num: "03" },
  { id: "shaft-domains",  key: "nav.domains",  num: "04" },
  { id: "shaft-call",     key: "nav.call",     num: "05" },
];

interface ShaftNavProps {
  visible: boolean;
}

export default function ShaftNav({ visible }: ShaftNavProps) {
  const [active, setActive]   = useState("shaft-hero");
  const [isLight, setIsLight] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { playSound } = useSoundEffects();
  const { locale, setLocale, t } = useTranslation();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 22, restDelta: 0.001 });

  /* Read saved theme on mount */
  useEffect(() => {
    try {
      if (localStorage.getItem("shaft-theme") === "light") setIsLight(true);
    } catch (_) {}
  }, []);

  /* Section IntersectionObserver */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { 
          if (e.isIntersecting) {
            setActive(e.target.id);
          }
        });
      },
      { threshold: 0.35 }
    );
    chapters.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    playSound("click");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleTheme = () => {
    playSound("hum");
    const next = !isLight;
    setIsLight(next);
    try {
      if (next) {
        document.documentElement.setAttribute("data-shaft-light", "");
        localStorage.setItem("shaft-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-shaft-light");
        localStorage.setItem("shaft-theme", "dark");
      }
    } catch (_) {}
  };

  const cycleLang = () => {
    playSound("click");
    const idx = LOCALES.findIndex((l) => l.code === locale);
    const next = LOCALES[(idx + 1) % LOCALES.length];
    setLocale(next.code);
  };

  return (
    <>
      {/* ── Desktop — right-side vertical chapter list ── */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col items-end"
            aria-label="Chapter navigation"
          >
            {/* Base connector line */}
            <div
              className="absolute right-0 top-2 bottom-2 w-px"
              style={{ backgroundColor: "rgb(var(--shaft-border))" }}
            />
            {/* Scroll-progress fill — crimson line grows from top */}
            <motion.div
              className="absolute right-0 top-2 bottom-2 w-px origin-top"
              style={{
                backgroundColor: "rgb(var(--shaft-crimson))",
                scaleY: progress,
              }}
            />

            {/* Chapter items */}
            {chapters.map((ch) => {
              const isActive = active === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => scrollTo(ch.id)}
                  className="relative flex items-center gap-2.5 pr-4 py-2.5 group"
                  aria-label={`Go to ${t(ch.key)}`}
                >
                  <span
                    className="font-space-mono text-[8px] tracking-[0.3em] uppercase transition-all duration-100"
                    style={{
                      color: isActive ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-muted))",
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {ch.num} <ShaftDecipher text={t(ch.key)} />
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="shaft-nav-bar"
                      className="absolute right-0 top-0 bottom-0 w-0.5"
                      style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                      transition={{ type: "spring", stiffness: 450, damping: 40 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="mt-5 pr-4 font-space-mono text-[7px] tracking-[0.28em] uppercase transition-opacity duration-100 hover:opacity-100"
              style={{ color: "rgb(var(--shaft-muted))", opacity: 0.45 }}
              aria-label="Toggle theme"
            >
              {isLight ? <ShaftDecipher text={t("nav.theme.dark")} /> : <ShaftDecipher text={t("nav.theme.light")} />}
            </button>

            {/* Language switcher — click to cycle */}
            <button
              onClick={cycleLang}
              className="mt-2 pr-4 font-space-mono text-[7px] tracking-[0.28em] uppercase transition-opacity duration-100 hover:opacity-100"
              style={{ color: "rgb(var(--shaft-gold))", opacity: 0.5 }}
              aria-label="Change language"
            >
              <ShaftDecipher text={`[ ${locale.toUpperCase()} ]`} />
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Mobile — fixed bottom strip ── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex lg:hidden items-center gap-0"
            style={{
              backgroundColor: "rgb(var(--shaft-surface))",
              border: "1px solid rgb(var(--shaft-border))",
            }}
          >
            {chapters.map((ch) => {
              const isActive = active === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => scrollTo(ch.id)}
                  className="relative px-3 py-2.5 transition-colors duration-100"
                  style={{
                    backgroundColor: isActive ? "rgb(var(--shaft-crimson))" : "transparent",
                  }}
                  aria-label={t(ch.key)}
                >
                  <span
                    className="font-space-mono text-[8px] tracking-[0.2em]"
                    style={{
                      color: isActive ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-muted))",
                    }}
                  >
                    {ch.num}
                  </span>
                </button>
              );
            })}
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              className="px-3 py-2.5 border-l transition-colors duration-100"
              style={{ borderColor: "rgb(var(--shaft-border))" }}
              aria-label="Toggle theme"
            >
              <span
                className="font-space-mono text-[8px] tracking-[0.1em]"
                style={{ color: "rgb(var(--shaft-muted))" }}
              >
                {isLight ? "D" : "L"}
              </span>
            </button>
            {/* Mobile language toggle */}
            <button
              onClick={cycleLang}
              className="px-3 py-2.5 border-l transition-colors duration-100"
              style={{ borderColor: "rgb(var(--shaft-border))" }}
              aria-label="Change language"
            >
              <span
                className="font-space-mono text-[8px] tracking-[0.1em]"
                style={{ color: "rgb(var(--shaft-gold))" }}
              >
                {locale.toUpperCase()}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
