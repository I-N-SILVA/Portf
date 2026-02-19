"use client";

import React from "react";
import { motion } from "framer-motion";

interface EditorialSidenoteProps {
    note: string;
    position?: "left" | "right";
    className?: string;
}

export default function EditorialSidenote({
    note,
    position = "left",
    className = "",
}: EditorialSidenoteProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: position === "left" ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`absolute ${position === "left" ? "-left-12 lg:-left-24" : "-right-12 lg:-right-24"} top-1/2 -translate-y-1/2 w-32 md:w-48 z-0 pointer-events-none select-none hidden xl:block ${className}`}
        >
            <div className="bg-primary/5 border-l-2 border-primary/20 p-3 backdrop-blur-sm">
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-tight opacity-40 leading-relaxed block italic">
                    {"// NOTE_SYS_ANNOTATION"}
                </span>
                <span className="text-[11px] md:text-sm font-medium tracking-tight text-foreground/60 leading-tight block mt-1">
                    {note}
                </span>
            </div>
        </motion.div>
    );
}
