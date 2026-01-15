"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

type CursorState = "default" | "hover" | "dragging" | "clickable";

export default function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide on mobile/touch devices
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      return;
    }

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if hovering draggable element
      if (target.closest('[data-draggable="true"]')) {
        setCursorState("hover");
      } else if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setCursorState("clickable");
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  const getCursorSize = () => {
    switch (cursorState) {
      case "hover":
        return { size: 60, dotSize: 8 };
      case "dragging":
        return { size: 80, dotSize: 10 };
      case "clickable":
        return { size: 40, dotSize: 6 };
      default:
        return { size: 32, dotSize: 4 };
    }
  };

  const getCursorColor = () => {
    switch (cursorState) {
      case "hover":
        return "#ff006e"; // neonPink
      case "dragging":
        return "#8338ec"; // electricPurple
      case "clickable":
        return "#3a86ff"; // skyBlue
      default:
        return "#ffffff";
    }
  };

  const { size, dotSize } = getCursorSize();
  const color = getCursorColor();

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full border-2 mix-blend-difference"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: "-50%",
          y: "-50%",
          width: size,
          height: size,
          borderColor: color,
        }}
        animate={{
          scale: cursorState === "clickable" ? [1, 1.2, 1] : 1,
        }}
        transition={{
          scale: {
            duration: 0.6,
            repeat: cursorState === "clickable" ? Infinity : 0,
            ease: "easeInOut",
          },
          width: { duration: 0.2 },
          height: { duration: 0.2 },
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-30 blur-md"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Center dot */}
      <motion.div
        className="absolute rounded-full mix-blend-difference"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: "-50%",
          y: "-50%",
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
        }}
        animate={{
          scale: cursorState === "hover" ? 1.5 : 1,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Text hint for hover state */}
      {cursorState === "hover" && (
        <motion.div
          className="absolute text-xs font-bold text-white whitespace-nowrap pointer-events-none"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
            x: "-50%",
            y: "-150%",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          DRAG
        </motion.div>
      )}
    </div>
  );
}
