"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMousePosition } from "@/components/context/MouseContext";

export const Cursor: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [hoverText, setHoverText] = useState("");
    const [coords, setCoords] = useState({ x: 0, y: 0 });

    const { mouseX, mouseY, springX: cursorX, springY: cursorY } = useMousePosition();

    useEffect(() => {
        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        const handleMouseMove = (e: MouseEvent) => {
            setCoords({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickable = target.closest('a, button, [role="button"]');

            if (clickable) {
                setIsHovered(true);
                const label = clickable.getAttribute('aria-label') ||
                    clickable.textContent?.trim().split('\n')[0].substring(0, 12) ||
                    "ACTION";
                setHoverText(label);
            } else {
                setIsHovered(false);
                setHoverText("");
            }
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseover", handleMouseOver);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseover", handleMouseOver);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <>
            {/* Tactical Crosshair / Brackets */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[10000]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            >
                {/* Dynamic Coordinate Label */}
                <motion.div 
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute top-8 left-8 whitespace-nowrap"
                >
                    <span className="font-space-mono text-[6px] tracking-widest text-white/40 uppercase">
                        TRK_POS: {coords.x},{coords.y}
                    </span>
                </motion.div>

                {/* Corner Brackets */}
                {[
                    "top-0 left-0 border-t border-l",
                    "top-0 right-0 border-t border-r",
                    "bottom-0 left-0 border-b border-l",
                    "bottom-0 right-0 border-b border-r",
                ].map((pos, i) => (
                    <motion.div
                        key={i}
                        className={`absolute w-2 h-2 ${pos}`}
                        style={{ borderColor: "rgb(var(--shaft-crimson))" }}
                        animate={{
                            scale: isHovered ? 1.5 : 1,
                            x: pos.includes("left") ? (isHovered ? -12 : -8) : (isHovered ? 12 : 8),
                            y: pos.includes("top") ? (isHovered ? -12 : -8) : (isHovered ? 12 : 8),
                        }}
                    />
                ))}
            </motion.div>

            {/* Main Inverted Cursor */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none rounded-full bg-white mix-blend-difference z-[9999] flex items-center justify-center overflow-hidden"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                    width: isHovered ? (hoverText ? 110 : 80) : 12,
                    height: isHovered ? (hoverText ? 110 : 80) : 12,
                }}
                animate={{
                    scale: isClicked ? 0.8 : 1,
                }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
                {isHovered && hoverText && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[8px] font-bold text-black uppercase tracking-[0.2em] text-center px-2 font-space-mono"
                    >
                        {hoverText}
                    </motion.span>
                )}
            </motion.div>

            {/* Subtle Outer Glow (Trailing) */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none rounded-full border border-white/10 z-[9998]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                    width: isHovered ? 140 : 40,
                    height: isHovered ? 140 : 40,
                }}
                animate={{
                    opacity: isHovered ? 0.4 : 0.1,
                }}
            />
        </>
    );
};

export default Cursor;
