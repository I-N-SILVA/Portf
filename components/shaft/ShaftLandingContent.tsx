"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";
import ShaftIntertitle from "./ShaftIntertitle";
import ShaftNav from "./ShaftNav";
import ShaftHero from "./ShaftHero";
import ShaftTicker from "./ShaftTicker";
import ShaftIdentity from "./ShaftIdentity";
import ShaftArchive from "./ShaftArchive";
import ShaftDomains from "./ShaftDomains";
import ShaftCall from "./ShaftCall";
import ShaftSocialDock from "./ShaftSocialDock";
import ShaftStatusStrip from "./ShaftStatusStrip";
import ShaftPerspectiveSection from "./ShaftPerspectiveSection";
import ShaftFloatingMeta from "./ShaftFloatingMeta";
import FloatingShinboShadows from "./FloatingShinboShadows";
import BootSequence from "@/components/ui/BootSequence";
import Cursor from "@/components/ui/inverted-cursor";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { LocaleProvider } from "@/lib/i18n";

export default function ShaftLandingContent() {
  const [stage, setStage] = useState<"boot" | "intertitle" | "main">("boot");
  const [isInverted, setIsInverted] = useState(false);
  const { playSound } = useSoundEffects();

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Map high velocity to a glitch intensity
  const glitchOpacity = useTransform(smoothVelocity, [-3000, -1500, 0, 1500, 3000], [0.4, 0, 0, 0, 0.4]);

  // Map high velocity to vignette strength
  const vignetteStrength = useTransform(smoothVelocity, [-3000, 0, 3000], [0.3, 0.1, 0.3]);
  const vignetteScale = useTransform(smoothVelocity, [-3000, 0, 3000], [0.95, 1, 0.95]);

  const handleBootComplete = useCallback(() => {
    setStage("intertitle");
  }, []);

  const handleIntertitleComplete = useCallback(() => {
    setStage("main");
    setTimeout(() => playSound("hum"), 100);
  }, [playSound]);

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
    <LocaleProvider>
      <Cursor />
      <div className="shaft-paper-texture" />
      <ShaftFloatingMeta />
      <FloatingShinboShadows />

      {/* Dynamic Vignette — tied to scroll speed */}
      <motion.div 
        style={{ 
          opacity: vignetteStrength,
          scale: vignetteScale,
          background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 150%)"
        }}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

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

      {stage === "main" && (
        <motion.main
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
          <ShaftNav visible={true} />
          <ShaftSocialDock />

          <ShaftPerspectiveSection>
            <ShaftHero />
          </ShaftPerspectiveSection>

          <ShaftTicker />

          <ShaftPerspectiveSection>
            <ShaftIdentity />
          </ShaftPerspectiveSection>

          <ShaftPerspectiveSection>
            <ShaftArchive />
          </ShaftPerspectiveSection>

          <ShaftPerspectiveSection>
            <ShaftDomains />
          </ShaftPerspectiveSection>

          <ShaftPerspectiveSection>
            <ShaftCall />
          </ShaftPerspectiveSection>
        </motion.main>
      )}
    </LocaleProvider>
  );
}
