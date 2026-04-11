"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShaftIntertitle from "./ShaftIntertitle";
import ShaftNav from "./ShaftNav";
import ShaftHero from "./ShaftHero";
import ShaftTicker from "./ShaftTicker";
import ShaftIdentity from "./ShaftIdentity";
import ShaftInsight from "./ShaftInsight";
import ShaftArchive from "./ShaftArchive";
import ShaftDomains from "./ShaftDomains";
import ShaftCall from "./ShaftCall";
import ShaftSocialDock from "./ShaftSocialDock";
import ShaftStatusStrip from "./ShaftStatusStrip";
import ShaftPerspectiveSection from "./ShaftPerspectiveSection";
import BootSequence from "@/components/ui/BootSequence";
import Cursor from "@/components/ui/inverted-cursor";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { LocaleProvider } from "@/lib/i18n";

export default function ShaftLandingContent() {
  const [stage, setStage] = useState<"boot" | "intertitle" | "main">("boot");
  const { playSound } = useSoundEffects();

  const handleBootComplete = useCallback(() => {
    setStage("intertitle");
  }, []);

  const handleIntertitleComplete = useCallback(() => {
    setStage("main");
    setTimeout(() => playSound("hum"), 100);
  }, [playSound]);

  return (
    <LocaleProvider>
      <Cursor />
      <div className="shaft-paper-texture" />
      
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
          style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
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
            <ShaftInsight />
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
