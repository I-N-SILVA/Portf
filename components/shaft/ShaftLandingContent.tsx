"use client";

import { useState, useCallback, useEffect } from "react";
import ShaftIntertitle from "./ShaftIntertitle";
import ShaftNav from "./ShaftNav";
import ShaftHero from "./ShaftHero";
import ShaftTicker from "./ShaftTicker";
import ShaftIdentity from "./ShaftIdentity";
import ShaftArchive from "./ShaftArchive";
import ShaftDomains from "./ShaftDomains";
import ShaftCall from "./ShaftCall";
import ShaftStatusStrip from "./ShaftStatusStrip";
import BootSequence from "@/components/ui/BootSequence";
import Cursor from "@/components/ui/inverted-cursor";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function ShaftLandingContent() {
  const [bootDone, setBootDone] = useState(false);
  const [intertitleDone, setIntertitleDone] = useState(false);
  const { playSound } = useSoundEffects();

  // Handle chain: Boot -> Intertitle -> Content
  useEffect(() => {
    // Hide boot after 2.5s (matching BootSequence logic approx)
    const timer = setTimeout(() => {
      setBootDone(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  const onIntertitleComplete = useCallback(() => {
    setIntertitleDone(true);
    // Sensory: play a subtle hum/glitch when the system "locks in"
    setTimeout(() => playSound("hum"), 100);
  }, [playSound]);

  return (
    <>
      {!bootDone && <BootSequence />}
      
      {bootDone && <ShaftIntertitle onComplete={onIntertitleComplete} />}

      <main
        className="w-full min-h-screen overflow-x-hidden shaft-flicker"
        style={{ 
          backgroundColor: "rgb(var(--shaft-bg))",
          opacity: intertitleDone ? 1 : 0,
          transition: "opacity 0.8s ease-in"
        }}
      >
        <Cursor />
        <ShaftStatusStrip />
        <ShaftNav visible={intertitleDone} />

        <ShaftHero />
        <ShaftTicker />
        <ShaftIdentity />
        <ShaftArchive />
        <ShaftDomains />
        <ShaftCall />
      </main>
    </>
  );
}
