"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShaftRedactProps {
  text?: string;
  className?: string;
  revealed?: boolean;
}

const CHARS = "ABCDEFGHIKLMNOPQRSTVXYZ0123456789!@#$%^&*()_+";

export default function ShaftRedact({ text = "", className, revealed = false }: ShaftRedactProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isRevealed, setIsRevealed] = useState(revealed);

  useEffect(() => {
    setIsRevealed(revealed);
  }, [revealed]);

  useEffect(() => {
    if (isRevealed) {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (index < iteration) return text[index];
              if (char === " ") return " ";
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 2;
      }, 40);
      return () => clearInterval(interval);
    } else {
      setDisplayText(text.replace(/[^\s]/g, "█"));
    }
  }, [isRevealed, text]);

  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.span
            key="redacted"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-space-mono"
            style={{ color: "rgb(var(--shaft-crimson))" }}
          >
            {displayText}
          </motion.span>
        ) : (
          <motion.span
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-space-mono"
          >
            {displayText}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
