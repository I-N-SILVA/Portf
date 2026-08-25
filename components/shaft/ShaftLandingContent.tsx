"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";
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
import { LocaleProvider, type Locale } from "@/lib/i18n";

export default function ShaftLandingContent({
  locale,
}: {
  /** Set by the /{locale} routes; absent on `/`, where the cookie decides. */
  locale?: Locale;
} = {}) {
  const [stage, setStage] = useState<"boot" | "intertitle" | "main">("boot");
  const [isInverted, setIsInverted] = useState(false);
  const { playSound } = useSoundEffects();

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Map high velocity to a glitch intensity
  const glitchOpacity = useTransform(smoothVelocity, [-3000, -1500, 0, 1500, 3000], [0.4, 0, 0, 0, 0.4]);

  const handleBootComplete = useCallback(() => {
    setStage("intertitle");
  }, []);

  const handleIntertitleComplete = useCallback(() => {
    setStage("main");
    setTimeout(() => playSound("hum"), 100);
  }, [playSound]);

  // Reduced motion skips the cinema.
  //
  // The landing page opens on a boot sequence and an intertitle, and the real
  // content only mounts once both have played. For someone who has asked for
  // less motion that is two unskippable animations standing between them and
  // the page — and, because #main doesn't exist until the end of it, the skip
  // link has nothing to skip to either. BootGate in the OS chrome already
  // makes the same concession; this brings the front door in line.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("main");
    }
  }, []);

  // Handle global "Negative Flash" event
  useEffect(() => {
    const triggerFlash = () => {
      setIsInverted(true);
      playSound("shutter");
      setTimeout(() => setIsInverted(false), 120);
    };

    window.addEventListener("shaft-flash", triggerFlash);
    return () => window.removeEventListener("shaft-flash", triggerFlash);
  }, [playSound]);

  return (
    <LocaleProvider initialLocale={locale}>
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
      
      {/* The intro plays *over* the page, not instead of it. Both of these are
          fixed, full-screen overlays with their own z-index, so the content
          below can render from the very first byte. */}
      <AnimatePresence mode="wait">
        {stage === "boot" && (
          <BootSequence key="boot" onComplete={handleBootComplete} />
        )}
        
        {stage === "intertitle" && (
          <ShaftIntertitle key="intertitle" onComplete={handleIntertitleComplete} />
        )}
      </AnimatePresence>

      {/*
        Always rendered, including in the server HTML.

        This used to be gated on `stage === "main"`, so the page a browser with
        no JavaScript received — and the page in the initial response for
        everyone else — contained a boot animation and none of the portfolio.
        It also meant the skip link pointed at an id that did not exist yet.

        While the intro is on screen the content is present but not reachable:
        `inert` takes it out of the tab order and hides it from assistive
        tech, so nobody lands focus on something they cannot see.
      */}
        <motion.main
          id="main"
          inert={stage !== "main" ? true : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full min-h-screen overflow-x-hidden relative"
          style={{ 
            backgroundColor: "rgb(var(--shaft-bg))",
            filter: isInverted ? "invert(1)" : "none" 
          }}
        >
          <ShaftStatusStrip />
          <ShaftNav visible={stage === "main"} />
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
