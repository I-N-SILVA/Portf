"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const AmbientClouds = () => {
    const { scrollYProgress } = useScroll();

    // Slight parallax effect on scroll
    const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
    const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
    const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden mix-blend-screen dark:mix-blend-lighten opacity-40 dark:opacity-20">
            {/* Cloud 1 */}
            <motion.div
                style={{ y: y1 }}
                animate={{
                    x: ["0%", "5%", "0%", "-5%", "0%"],
                    scale: [1, 1.05, 1, 0.95, 1],
                }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[50vh] bg-sky-200/40 dark:bg-sky-primary/20 rounded-[100%] blur-[120px] will-change-transform"
            />
            {/* Cloud 2 */}
            <motion.div
                style={{ y: y2 }}
                animate={{
                    x: ["0%", "-8%", "0%", "8%", "0%"],
                    scale: [1, 1.1, 1, 0.9, 1],
                }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 10 }}
                className="absolute top-[30%] right-[-20%] w-[60vw] h-[60vh] bg-blue-200/30 dark:bg-sky-secondary/20 rounded-[100%] blur-[150px] will-change-transform"
            />
            {/* Cloud 3 */}
            <motion.div
                style={{ y: y3 }}
                animate={{
                    x: ["0%", "10%", "0%", "-10%", "0%"],
                    scale: [1, 0.95, 1, 1.05, 1],
                }}
                transition={{ duration: 55, repeat: Infinity, ease: "linear", delay: 5 }}
                className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[40vh] bg-indigo-200/20 dark:bg-sky-primary/10 rounded-[100%] blur-[100px] will-change-transform"
            />
        </div>
    );
};

export default AmbientClouds;
