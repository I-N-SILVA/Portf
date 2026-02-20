"use client";

import React from "react";

interface MagazineHeaderProps {
    title: string;
    subtitle?: string;
    variant?: "default" | "outline" | "stamped";
    className?: string;
}

export default function MagazineHeader({
    title,
    subtitle,
    variant = "default",
    className = "",
}: MagazineHeaderProps) {
    return (
        <div className={`flex flex-col mb-8 ${className}`}>
            {subtitle && (
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary mb-2">
                    {subtitle}
                </span>
            )}
            <h2 className={`
                text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] 
                font-[family-name:var(--font-outfit)]
                ${variant === "outline" ? "text-transparent stroke-2" : "text-foreground"}
                ${variant === "stamped" ? "opacity-90 italic" : ""}
            `}
                style={variant === "outline" ? {
                    WebkitTextStroke: "1px rgb(var(--foreground))",
                    textShadow: "1px 1px 0px rgba(var(--primary), 0.1)"
                } : {}}
            >
                {title}
            </h2>
        </div>
    );
}
