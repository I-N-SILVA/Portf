"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const Cursor: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

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
            const isClickable =
                target.closest('a') ||
                target.closest('button') ||
                target.closest('[role="button"]') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovered(!!isClickable);
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
        <motion.div
            className="fixed top-0 left-0 pointer-events-none rounded-full bg-white mix-blend-difference z-[9999]"
            style={{
                x: cursorX,
                y: cursorY,
                translateX: "-50%",
                translateY: "-50%",
                width: isHovered ? 80 : 24,
                height: isHovered ? 80 : 24,
            }}
            animate={{
                scale: isClicked ? 0.8 : 1,
                opacity: 1,
            }}
            transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                mass: 0.5,
                width: { duration: 0.3 },
                height: { duration: 0.3 },
            }}
        >
            {/* Inner dot for precision */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"
                animate={{
                    opacity: isHovered ? 0 : 1
                }}
            />
        </motion.div>
    );
};

export default Cursor;
