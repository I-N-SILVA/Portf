"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const META_SAMPLES = [
  "OBSERVING_USER_INPUT",
  "FETCHING_ARCHIVE_SECTOR_7",
  "REDACTION_ACTIVE",
  "CORE_LOAD_STABLE",
  "SIGNAL_SYNC_98.2%",
  "DECODING_LAYER_B",
  "ENCRYPTION_OVERRIDE",
  "PARCHMENT_TEXTURE_ENABLED",
  "SHINBO_PERSPECTIVE_LOCKED"
];

export default function ShaftFloatingMeta() {
  const [items, setItems] = useState<{ id: number; text: string; x: string; y: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const newItems = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      text: META_SAMPLES[Math.floor(Math.random() * META_SAMPLES.length)],
      x: `${10 + Math.random() * 80}%`,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 20
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-20">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "-10%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear"
          }}
          className="absolute font-space-mono text-[6px] tracking-[0.5em] uppercase"
          style={{ 
            left: item.x, 
            writingMode: "vertical-rl", 
            color: "rgb(var(--shaft-muted))" 
          }}
        >
          {item.text}
        </motion.div>
      ))}
    </div>
  );
}
