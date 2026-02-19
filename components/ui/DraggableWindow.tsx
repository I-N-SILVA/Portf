"use client";

import React, { useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Minus, Square, X } from "lucide-react";

interface DraggableWindowProps {
    title: string;
    children: React.ReactNode;
    initialX?: number;
    initialY?: number;
    width?: string;
    className?: string;
}

export default function DraggableWindow({
    title,
    children,
    initialX = 0,
    initialY = 0,
    width = "w-full overflow-hidden",
    className = "",
}: DraggableWindowProps) {
    const dragControls = useDragControls();
    const constraintsRef = useRef(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div ref={constraintsRef} className={`relative ${className}`}>
            <motion.div
                drag={!isMobile}
                dragControls={dragControls}
                dragMomentum={false}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                dragElastic={0}
                initial={isMobile ? { x: 0, y: 0, opacity: 0, scale: 0.95 } : { x: initialX, y: initialY, opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileDrag={{ scale: 1.02, zIndex: 50 }}
                className={`${width} bg-card border-2 border-border rounded-xl shadow-[8px_8px_0px_0px_rgba(var(--color-text-primary),0.1)] overflow-hidden flex flex-col`}
            >
                {/* Title Bar */}
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="h-10 bg-primary/20 border-b-2 border-border flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-destructive/50 border border-destructive" />
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-60">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Minus className="w-3 h-3 opacity-40" />
                        <Square className="w-2.5 h-2.5 opacity-40" />
                        <X className="w-3 h-3 opacity-40" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-1 relative">
                    {/* Magazine Header Overlay (Subtle) */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none">
                        <span className="text-8xl font-black italic tracking-tighter uppercase font-[family-name:var(--font-outfit)]">
                            {title.split(' ')[0]}
                        </span>
                    </div>

                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
