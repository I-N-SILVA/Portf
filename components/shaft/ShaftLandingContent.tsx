"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring, useReducedMotion } from "framer-motion";
import ShaftIntertitle from "./ShaftIntertitle";
import ShaftNav from "./ShaftNav";
import ShaftHero from "./ShaftHero";
import ShaftTicker from "./ShaftTicker";
import ShaftIdentity from "./ShaftIdentity";
import ShaftOffers from "./ShaftOffers";
import ShaftArchive from "./ShaftArchive";

import ShaftCall from "./ShaftCall";
import ShaftSocialDock from "./ShaftSocialDock";
import ShaftMobileCTA from "./ShaftMobileCTA";
import ShaftStatusStrip from "./ShaftStatusStrip";
import ShaftPerspectiveSection from "./ShaftPerspectiveSection";
import BootSequence from "@/components/ui/BootSequence";
import Cursor from "@/components/ui/inverted-cursor";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { LocaleProvider } from "@/lib/i18n";

/**
 * `sessionStorage` key set once the intro has played. A companion inline
 * script in app/layout.tsx reads it before first paint and stamps
 * `data-booted` on <html>, so a returning visitor never sees a frame of the
 * boot overlay while React hydrates.
 */
const BOOTED_KEY = "shaft-booted";

export default function ShaftLandingContent() {
  const [stage, setStage] = useState<"boot" | "intertitle" | "main">("boot");
  const [isInverted, setIsInverted] = useState(false);
  const { playSound } = useSoundEffects();
  const reduceMotion = useReducedMotion();

  // Play the intro once per session, not once per navigation.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOTED_KEY)) setStage("main");
    } catch {
      // Private mode, or storage disabled — just play the intro.
    }
  }, []);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Map high velocity to a glitch intensity
  const glitchOpacity = useTransform(
    smoothVelocity,
    [-3000, -1500, 0, 1500, 3000],
    reduceMotion ? [0, 0, 0, 0, 0] : [0.4, 0, 0, 0, 0.4],
  );

  const handleBootComplete = useCallback(() => {
    setStage("intertitle");
  }, []);

  const handleIntertitleComplete = useCallback(() => {
    setStage("main");
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
      document.documentElement.dataset.booted = "1";
    } catch {
      // Nothing to remember it with; the intro plays again next time.
    }
    setTimeout(() => playSound("hum"), 100);
  }, [playSound]);

  // Handle global "Negative Flash" event
  useEffect(() => {
    const triggerFlash = () => {
      // A full-screen inversion, fired by every nav click, theme toggle,
      // language change and archive row. It is driven by React state rather
      // than a CSS animation, so the blanket `animation-duration: 0.01ms`
      // rule in globals.css never suppressed it — this does. The shutter
      // sound is not motion and still plays.
      playSound("shutter");
      if (reduceMotion) return;
      setIsInverted(true);
      setTimeout(() => setIsInverted(false), 120);
    };

    window.addEventListener("shaft-flash", triggerFlash);
    return () => window.removeEventListener("shaft-flash", triggerFlash);
  }, [playSound, reduceMotion]);

  return (
    <LocaleProvider>
      <Cursor />
      <div className="shaft-paper-texture" />

      {/* Signal Interference / Glitch Overlay */}
      <motion.div 
        style={{ opacity: glitchOpacity }}
        className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[rgb(var(--shaft-crimson)/0.05)] mix-blend-screen" />
        <div className="absolute inset-0 shaft-scanline opacity-50" />
      </motion.div>

      {/* Negative Flash Overlay */}
      <AnimatePresence>
        {isInverted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white mix-blend-difference pointer-events-none"
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {stage === "boot" && (
          <BootSequence key="boot" onComplete={handleBootComplete} />
        )}
        
        {stage === "intertitle" && (
          <ShaftIntertitle key="intertitle" onComplete={handleIntertitleComplete} />
        )}
      </AnimatePresence>

      {/*
        Always rendered, never gated on `stage`.

        The intro used to withhold the whole page until it finished, which
        meant the server sent a document containing the boot log and nothing
        else — no hero, no archive, no links, and none of the #anchors the
        sitemap advertises. The overlays below cover this while they play, so
        the intro looks identical and the markup is there from the first byte.
      */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full min-h-screen overflow-x-hidden relative"
        style={{
          backgroundColor: "rgb(var(--shaft-bg))",
          filter: isInverted ? "invert(1)" : "none",
        }}
      >
          <ShaftStatusStrip />
          <ShaftNav visible={true} />
          <ShaftSocialDock />
          <ShaftMobileCTA />

          <ShaftPerspectiveSection>
            <ShaftHero />
          </ShaftPerspectiveSection>

          <ShaftTicker />

          <ShaftPerspectiveSection>
            <ShaftIdentity />
          </ShaftPerspectiveSection>

          <ShaftPerspectiveSection>
            <ShaftOffers />
          </ShaftPerspectiveSection>

          <ShaftPerspectiveSection>
            <ShaftArchive />
          </ShaftPerspectiveSection>



        <ShaftPerspectiveSection>
          <ShaftCall />
        </ShaftPerspectiveSection>
      </motion.main>
    </LocaleProvider>
  );
}
