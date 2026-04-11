"use client";

import { useState, useEffect, useCallback } from "react";

interface ShaftDecipherProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  hoverOnly?: boolean;
}

const CHARS = "ABCDEFGHIKLMNOPQRSTVXYZ0123456789!@#$%^&*()_+";

export default function ShaftDecipher({ text, className, style, hoverOnly = true }: ShaftDecipherProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);

  const scramble = useCallback((targetText: string) => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        targetText
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= targetText.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 30);
    return interval;
  }, []);

  useEffect(() => {
    if (!hoverOnly) {
      const interval = scramble(text);
      return () => clearInterval(interval);
    }
  }, [text, scramble, hoverOnly]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    scramble(text);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </span>
  );
}
