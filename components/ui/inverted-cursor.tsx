"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const Cursor: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [hoverText, setHoverText] = useState("");

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smooth spring configuration
    const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickable = target.closest('a, button, [role="button"]');

            if (clickable) {
                setIsHovered(true);
                // Extract label or aria-label for cursor text
                const label = clickable.getAttribute('aria-label') ||
                    clickable.textContent?.trim().split('\n')[0].substring(0, 12) ||
                    "";
                setHoverText(label);
            } else {
                setIsHovered(false);
                setHoverText("");
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [mouseX, mouseY]);

    return (
        <>
            {/* Main Cursor */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none rounded-full bg-white mix-blend-difference z-[9999] flex items-center justify-center overflow-hidden"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                    width: isHovered ? (hoverText ? 100 : 80) : 16,
                    height: isHovered ? (hoverText ? 100 : 80) : 16,
                }}
                animate={{
                    scale: isClicked ? 0.6 : 1,
                    rotate: isHovered ? 15 : 0,
                }}
                transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 400,
                    mass: 0.5,
                }}
            >
                {isHovered && hoverText && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] font-black text-black dark:text-sky-page uppercase tracking-[0.2em] text-center px-1 font-[family-name:var(--font-outfit)]"
                    >
                        {hoverText}
                    </motion.span>
                )}
            </motion.div>

            {/* Trailing Ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none rounded-full border border-sky-primary/30 dark:border-sky-primary/50 z-[9998] shadow-sky-glow dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.4)]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                    width: isHovered ? 120 : 32,
                    height: isHovered ? 120 : 32,
                }}
                animate={{
                    opacity: isClicked ? 0 : 0.6,
                    scale: isHovered ? 1.1 : 1,
                }}
                transition={{
                    type: "spring",
                    damping: 40,
                    stiffness: 300,
                    mass: 0.8,
                }}
            />
        </>
    );
};

export default Cursor;
