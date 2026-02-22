"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const AmbientHorizon = () => {
    const { scrollYProgress } = useScroll();

    // Light source moves horizontally based on scroll depth
    const lightX = useTransform(scrollYProgress, [0, 1], ["-20%", "120%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 0.6, 0.6, 0]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {/* Top Horizon Glow */}
            <motion.div
                style={{
                    left: lightX,
                    opacity,
                    willChange: "transform, opacity",
                }}
                className="absolute top-0 w-[40%] h-[15vh] -translate-x-1/2 bg-gradient-to-b from-sky-primary/20 via-sky-primary/5 to-transparent blur-[60px] dark:from-sky-primary/10 dark:via-sky-primary/2 dark:to-transparent"
            />

            {/* Bottom Horizon Glow */}
            <motion.div
                style={{
                    right: lightX,
                    opacity,
                    willChange: "transform, opacity",
                }}
                className="absolute bottom-0 w-[40%] h-[15vh] translate-x-1/2 bg-gradient-to-t from-sky-primary/20 via-sky-primary/5 to-transparent blur-[60px] dark:from-sky-primary/10 dark:via-sky-primary/2 dark:to-transparent"
            />

            {/* Vertical Edge Glows (Subtle accents) */}
            <motion.div
                style={{
                    opacity: useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0, 0.3, 0]),
                    willChange: "opacity"
                }}
                className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-sky-primary/20 to-transparent blur-md"
            />
            <motion.div
                style={{
                    opacity: useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0, 0.3, 0]),
                    willChange: "opacity"
                }}
                className="absolute right-0 top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-sky-primary/20 to-transparent blur-md"
            />
        </div>
    );
};

export default AmbientHorizon;
