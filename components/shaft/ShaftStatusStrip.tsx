"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

export default function ShaftStatusStrip() {
  const [time, setTime] = useState("");
  const [uptime, setUptime] = useState(0);
  
  // Random "Load" pulses for the diagnostic look
  const [load, setLoad] = useState(42);

  useEffect(() => {
    const start = Date.now();
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setUptime(Math.floor((Date.now() - start) / 1000));
      setLoad(Math.floor(Math.random() * (65 - 38 + 1) + 38));
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
        <div 
          className="w-1.5 h-1.5 shaft-status-pulse mb-4"
          style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
        />
        <span 
          className="font-space-mono text-[7px] tracking-[0.5em] uppercase rotate-180"
          style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-muted))" }}
        >
          SYSTEM_ACTIVE
        </span>
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
                    animate={{ height: `${load}%` }}
                    className="absolute bottom-0 left-0 right-0 bg-crimson"
                    style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                />
            </div>
        </div>

        <span 
          className="font-space-mono text-[7px] tracking-[0.3em] uppercase opacity-40"
          style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-muted))" }}
        >
          LAT: 51.5074° N // LON: 0.1278° W
        </span>

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
        <div 
          className="w-px h-12"
          style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
        />
      </div>
    </div>
  );
}
