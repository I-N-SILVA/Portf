"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { useTheme } from "next-themes";

type CursorState = "default" | "hover" | "dragging" | "clickable";

const CustomCursor = memo(function CustomCursor() {
  const { theme } = useTheme();
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [isVisible, setIsVisible] = useState(false);

  // ... rest of state ...

  // High visibility colors logic moved to render or kept here but safe
  const primaryColor = theme === "dark" ? "#ffffff" : "#000000";
  const hoverColor = theme === "dark" ? "#ff006e" : "#d90429";
  const rafRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Tighter spring physics for snappier response
  const springConfig = { damping: 35, stiffness: 800, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide on mobile/touch devices
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      return;
    }

    setIsVisible(true);

    // Use RAF for smooth cursor updates
    const updateCursor = () => {
      cursorX.set(lastMousePos.current.x);
      cursorY.set(lastMousePos.current.y);
      rafRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Throttle updates using RAF
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateCursor);
      }
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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  const size = cursorState === "hover" ? 60 : cursorState === "dragging" ? 80 : cursorState === "clickable" ? 40 : 32;
  const dotSize = cursorState === "hover" ? 8 : cursorState === "dragging" ? 10 : cursorState === "clickable" ? 6 : 4;

  const color = cursorState === "hover" ? hoverColor : cursorState === "dragging" ? "#8338ec" : cursorState === "clickable" ? "#3a86ff" : primaryColor;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: "-50%",
          y: "-50%",
          width: size,
          height: size,
          borderColor: color,
          willChange: "transform",
        }}
      />

      {/* Center dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          x: "-50%",
          y: "-50%",
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
          willChange: "transform",
        }}
      />
    </div>
  );
});

export default CustomCursor;
