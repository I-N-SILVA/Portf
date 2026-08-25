"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useSoundEffects, useSoundPreference } from "@/hooks/useSoundEffects";
import { useTranslation, LOCALES, type Locale } from "@/lib/i18n";
import ShaftDecipher from "./ShaftDecipher";

const chapters = [
  { id: "shaft-hero",     key: "nav.opening",  num: "01" },
  { id: "shaft-identity", key: "nav.identity", num: "02" },
  { id: "shaft-offers",   key: "nav.offers",   num: "03" },
  { id: "shaft-archive",  key: "nav.archive",  num: "04" },
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
  const [soundOn, setSoundOn] = useSoundPreference();
  const { locale, setLocale, t } = useTranslation();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 22, restDelta: 0.001 });

  /* Read saved theme on mount */
  useEffect(() => {
    try {
      if (localStorage.getItem("shaft-theme") === "light") setIsLight(true);
    } catch {}
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
    window.dispatchEvent(new CustomEvent("shaft-flash"));
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleTheme = () => {
    playSound("hum");
    window.dispatchEvent(new CustomEvent("shaft-flash"));
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
    } catch {}
  };

  const selectLang = (code: Locale) => {
    playSound("click");
    window.dispatchEvent(new CustomEvent("shaft-flash"));
    setLocale(code);
    setLangOpen(false);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          TOP-LEFT: Theme & Language Controls
          Fixed top-left corner — always visible, prominent
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="fixed top-5 left-5 md:top-8 md:left-8 z-[101] flex items-center gap-2"
          >
            {/* Sound toggle.
                Sits first because it's the control someone reaches for in a
                hurry: the site makes noise on click, hover and page change,
                and until now there was no way to stop it. Clicking it off is
                itself silent — playing a click to confirm you want silence is
                the wrong answer. */}
              <button
                onClick={() => {
                  const next = !soundOn;
                  if (next) playSound("click");
                  setSoundOn(next);
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-transparent hover:border-[rgb(var(--shaft-crimson))] transition-colors duration-200 group"
                style={{ backgroundColor: "transparent" }}
                aria-pressed={!soundOn}
                aria-label={soundOn ? "Mute interface sound" : "Unmute interface sound"}
              >
                <span className="text-[10px]" style={{ color: "rgb(var(--shaft-gold))" }}>
                  {soundOn ? "◈" : "◇"}
                </span>
                <span
                  className="font-space-mono text-[8px] tracking-[0.25em] uppercase transition-colors group-hover:text-[rgb(var(--shaft-crimson))]"
                  style={{ color: "rgb(var(--shaft-muted))" }}
                >
                  {soundOn ? "SOUND" : "MUTED"}
                </span>
              </button>

            {/* Theme toggle — prominent pill button */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 border border-transparent hover:border-[rgb(var(--shaft-crimson))] transition-colors duration-200 group"
                style={{
                  backgroundColor: "transparent",
                }}
                aria-label="Toggle theme"
              >
                {/* Sun/Moon icon */}
                <span className="text-[10px]" style={{ color: "rgb(var(--shaft-gold))" }}>
                  {isLight ? "◐" : "◑"}
                </span>
                <span
                  className="font-space-mono text-[8px] tracking-[0.25em] uppercase transition-colors group-hover:text-[rgb(var(--shaft-crimson))]"
                  style={{ color: "rgb(var(--shaft-muted))" }}
                >
                  {isLight ? "DARK" : "LIGHT"}
                </span>
              </button>

              {/* Language selector — dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-transparent hover:border-[rgb(var(--shaft-crimson))] transition-colors duration-200 group"
                  style={{
                    backgroundColor: "transparent",
                  }}
                  aria-label="Change language"
                >
                <span className="text-[10px]" style={{ color: "rgb(var(--shaft-gold))" }}>
                  ⌐
                </span>
                <span
                  className="font-space-mono text-[8px] tracking-[0.25em] uppercase font-bold"
                  style={{ color: "rgb(var(--shaft-cream))" }}
                >
                  {locale.toUpperCase()}
                </span>
                <motion.span
                  animate={{ rotate: langOpen ? 180 : 0 }}
                  className="text-[7px]"
                  style={{ color: "rgb(var(--shaft-muted))" }}
                >
                  ▾
                </motion.span>
              </button>

              {/* Dropdown panel */}
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scaleY: 0.9 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -4, scaleY: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 origin-top border overflow-hidden"
                    style={{
                      borderColor: "rgb(var(--shaft-border))",
                      backgroundColor: "rgb(var(--shaft-surface) / 0.95)",
                      backdropFilter: "blur(20px)",
                      minWidth: "120px",
                    }}
                  >
                    {LOCALES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => selectLang(l.code)}
                        className="w-full flex items-center justify-between px-3 py-2 transition-all duration-100 hover:pl-4"
                        style={{
                          backgroundColor: locale === l.code ? "rgb(var(--shaft-crimson) / 0.15)" : "transparent",
                          borderBottom: "1px solid rgb(var(--shaft-border) / 0.5)",
                        }}
                      >
                        <span
                          className="font-space-mono text-[8px] tracking-[0.2em] uppercase"
                          style={{
                            color: locale === l.code ? "rgb(var(--shaft-cream))" : "rgb(var(--shaft-muted))",
                          }}
                        >
                          {l.label}
                        </span>
                        <span
                          className="font-space-mono text-[7px] tracking-[0.15em]"
                          style={{
                            color: locale === l.code ? "rgb(var(--shaft-crimson))" : "rgb(var(--shaft-muted) / 0.5)",
                          }}
                        >
                          {l.native}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP: Right-side vertical chapter list
          ═══════════════════════════════════════════════════════════════ */}
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
            {/* Scroll-progress fill */}
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
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE: Fixed bottom strip — chapter nav only
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex lg:hidden items-center gap-0"
            style={{
              backgroundColor: "rgb(var(--shaft-surface) / 0.9)",
              border: "1px solid rgb(var(--shaft-border))",
              backdropFilter: "blur(16px)",
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
