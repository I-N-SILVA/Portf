"use client";

import { motion } from "framer-motion";

export default function BlueprintGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] overflow-hidden z-0">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
                    backgroundSize: '200px 200px',
                    border: '1px solid currentColor',
                }}
            />
            {/* Moving highlights */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent w-full h-full"
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ width: '50%' }}
            />
        </div>
    );
}
