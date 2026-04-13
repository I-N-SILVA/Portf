"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Shaft Reticle Cursor
 * ────────────────────
 * A cinematic targeting reticle cursor inspired by anime HUDs.
 * - Default state: Thin crosshair with rotating corner brackets
 * - Hover state: Expands into a "film frame" with action label
 * - Click state: Snaps inward with a crimson pulse
 * - Continuously rotates an outer ring with tick marks
 */
export const Cursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hoverText, setHoverText] = useState("");
  const [isMobile, setIsMobile] = useState(true); // default true to avoid flash
  const [isInViewport, setIsInViewport] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const cursorX = useSpring(x, { stiffness: 400, damping: 30, mass: 0.5 });
  const cursorY = useSpring(y, { stiffness: 400, damping: 30, mass: 0.5 });

  const updateCursorPosition = useCallback(() => {
    x.set(lastPosRef.current.x);
    y.set(lastPosRef.current.y);
    rafRef.current = null;
  }, [x, y]);

  useEffect(() => {
    // Disable custom cursor on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsMobile(true);
      return;
    }
    setIsMobile(false);

    const handleMouseMove = (e: MouseEvent) => {
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateCursorPosition);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('a, button, [role="button"], input, textarea, select, [data-draggable="true"]');
      if (clickable) {
        setIsHovered(true);
        const label = clickable.getAttribute('aria-label') ||
          clickable.textContent?.trim().split('\n')[0].substring(0, 14) ||
          "→";
        setHoverText(label);
      } else {
        setIsHovered(false);
        setHoverText("");
      }
    };

    // Hide cursor when mouse leaves the viewport
    const handleMouseLeave = () => setIsInViewport(false);
    const handleMouseEnter = () => setIsInViewport(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateCursorPosition]);

  if (isMobile) return null;

  const size = isHovered ? 80 : 24;
  const ringSize = isHovered ? 100 : 40;

  return (
    <>
      {/* ── Outer rotating ring with tick marks ── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          width: ringSize,
          height: ringSize,
        }}
        animate={{ opacity: isInViewport ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {/* Outer ring — only visible on hover */}
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="rgb(var(--shaft-crimson))"
            strokeWidth="0.5"
            opacity={isHovered ? 0.6 : 0}
            className="transition-opacity duration-200"
          />
          {/* Tick marks around the circle */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + 42 * Math.cos(angle);
            const y1 = 50 + 42 * Math.sin(angle);
            const x2 = 50 + 46 * Math.cos(angle);
            const y2 = 50 + 46 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgb(var(--shaft-crimson))"
                strokeWidth={i % 3 === 0 ? "1.5" : "0.5"}
                opacity={isHovered ? 0.8 : 0.2}
                className="transition-opacity duration-200"
              />
            );
          })}
        </motion.svg>
      </motion.div>

      {/* ── Main reticle center ── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          width: size,
          height: size,
        }}
        animate={{
          scale: isClicked ? 0.75 : 1,
          opacity: isInViewport ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
      >
        {/* Crosshair lines — always visible */}
        {!isHovered && (
          <>
            {/* Vertical */}
            <div
              className="absolute w-px"
              style={{
                height: 10,
                top: -2,
                backgroundColor: "rgb(var(--shaft-cream))",
                opacity: 0.5,
              }}
            />
            <div
              className="absolute w-px"
              style={{
                height: 10,
                bottom: -2,
                backgroundColor: "rgb(var(--shaft-cream))",
                opacity: 0.5,
              }}
            />
            {/* Horizontal */}
            <div
              className="absolute h-px"
              style={{
                width: 10,
                left: -2,
                backgroundColor: "rgb(var(--shaft-cream))",
                opacity: 0.5,
              }}
            />
            <div
              className="absolute h-px"
              style={{
                width: 10,
                right: -2,
                backgroundColor: "rgb(var(--shaft-cream))",
                opacity: 0.5,
              }}
            />
          </>
        )}

        {/* Center dot */}
        <motion.div
          className="rounded-full"
          style={{
            backgroundColor: "rgb(var(--shaft-crimson))",
          }}
          animate={{
            width: isHovered ? 4 : 3,
            height: isHovered ? 4 : 3,
            opacity: isClicked ? 1 : 0.8,
            boxShadow: isClicked
              ? "0 0 12px 3px rgb(var(--shaft-crimson) / 0.5)"
              : "0 0 4px 1px rgb(var(--shaft-crimson) / 0.2)",
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Corner brackets — expand on hover */}
        {[
          { t: 0, l: 0, br: "border-t border-l" },
          { t: 0, r: 0, br: "border-t border-r" },
          { b: 0, l: 0, br: "border-b border-l" },
          { b: 0, r: 0, br: "border-b border-r" },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos.br}`}
            style={{
              borderColor: "rgb(var(--shaft-crimson))",
              ...(pos.t !== undefined && { top: 0 }),
              ...(pos.b !== undefined && { bottom: 0 }),
              ...(pos.l !== undefined && { left: 0 }),
              ...(pos.r !== undefined && { right: 0 }),
            }}
            animate={{
              width: isHovered ? 10 : 5,
              height: isHovered ? 10 : 5,
              opacity: isHovered ? 0.9 : 0.4,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}

        {/* Hover label */}
        {isHovered && hoverText && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-4 whitespace-nowrap"
          >
            <span
              className="font-space-mono text-[7px] tracking-[0.25em] uppercase px-2 py-1 border"
              style={{
                color: "rgb(var(--shaft-cream))",
                borderColor: "rgb(var(--shaft-crimson) / 0.4)",
                backgroundColor: "rgb(var(--shaft-bg) / 0.8)",
              }}
            >
              {hoverText}
            </span>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default Cursor;
