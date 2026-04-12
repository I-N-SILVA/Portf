"use client";

import { motion, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function ShaftStatusStrip() {
  const [time, setTime] = useState("");
  const [uptime, setUptime] = useState(0);
  
  // Base random "Load" pulses
  const [baseLoad, setBaseLoad] = useState(42);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Smooth out the velocity reaction
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // Map velocity to extra load (up to 40% additional)
  const extraLoad = useTransform(smoothVelocity, [-3000, 0, 3000], [40, 0, 40]);
  
  // Combine baseLoad state and extraLoad MotionValue
  // Since we want baseLoad to affect it too, and baseLoad is state,
  // we'll use baseLoad directly in height calculation.
  const heightStr = useTransform(extraLoad, (latest) => `${Math.min(100, baseLoad + latest)}%`);

  useEffect(() => {
    const start = Date.now();
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setUptime(Math.floor((Date.now() - start) / 1000));
      setBaseLoad(Math.floor(Math.random() * (55 - 38 + 1) + 38));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed left-6 top-0 bottom-0 w-px z-[100] hidden xl:flex flex-col items-center py-12 pointer-events-none">
      {/* Connector line */}
      <div 
        className="absolute inset-y-0 left-0 w-px"
        style={{ backgroundColor: "rgb(var(--shaft-border))" }}
      />
      
      {/* Top indicator */}
      <div className="relative mb-auto flex flex-col items-center">
        <motion.div 
          animate={{ 
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-1.5 h-1.5 mb-4"
          style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
        />
        <motion.span 
          animate={{ x: [0, 0.5, -0.5, 0] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
          className="font-space-mono text-[7px] tracking-[0.5em] uppercase rotate-180"
          style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-muted))" }}
        >
          SYSTEM_ACTIVE
        </motion.span>
      </div>

      {/* Middle — Diagnostics (The "Alive" part) */}
      <div className="my-auto py-8 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center">
            <span 
                className="font-space-mono text-[6px] tracking-[0.3em] uppercase opacity-40 mb-2"
                style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-muted))" }}
            >
                CORE_LOAD
            </span>
            <div className="w-1 h-12 bg-white/5 relative overflow-hidden">
                <motion.div 
                    style={{ 
                      height: heightStr,
                      backgroundColor: "rgb(var(--shaft-crimson))" 
                    }}
                    className="absolute bottom-0 left-0 right-0"
                />
            </div>
        </div>

        <motion.span 
          whileHover={{ x: [0, -1, 1, 0] }}
          className="font-space-mono text-[7px] tracking-[0.3em] uppercase opacity-40"
          style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-muted))" }}
        >
          LAT: 51.5074° N // LON: 0.1278° W
        </motion.span>

        <div className="flex flex-col items-center">
            <span 
                className="font-space-mono text-[6px] tracking-[0.3em] uppercase opacity-40 mb-2"
                style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-muted))" }}
            >
                UPTIME
            </span>
            <span className="font-space-mono text-[7px] text-white/60">
                {String(uptime).padStart(4, "0")}s
            </span>
        </div>
      </div>

      {/* Bottom — Clock */}
      <div className="mt-auto flex flex-col items-center">
        <span 
          className="font-space-mono text-[8px] tracking-[0.4em] mb-4"
          style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-cream-dim))" }}
        >
          {time}
        </span>
        <motion.div 
          animate={{ height: [48, 56, 48] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12"
          style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
        />
      </div>
    </div>
  );
}
