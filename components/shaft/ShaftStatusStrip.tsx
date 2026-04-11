"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ShaftStatusStrip() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
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

      {/* Middle — Coordinate tracker (mock) */}
      <div className="my-auto py-8">
        <span 
          className="font-space-mono text-[7px] tracking-[0.3em] uppercase opacity-40"
          style={{ writingMode: "vertical-rl", color: "rgb(var(--shaft-muted))" }}
        >
          LAT: 51.5074° N // LON: 0.1278° W
        </span>
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
