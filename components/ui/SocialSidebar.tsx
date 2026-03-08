"use client";

import React from "react";
import { motion } from "framer-motion";
import { Instagram, Youtube, Linkedin, Github } from "lucide-react";
import { socialLinks } from "@/lib/placeholder-content";

// Substack icon (SVG)
const SubstackIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        stroke="none"
    >
        <path d="M22.539 8.242H1.46V5.406h21.078v2.836zM1.46 10.812V24L12 18.11L22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.078V0z" />
    </svg>
);

const iconMap: Record<string, any> = {
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
    github: Github,
    substack: SubstackIcon,
};

export default function SocialSidebar() {
    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6 items-center">
            {socialLinks.map((link, index) => {
                const Icon = iconMap[link.icon] || Github;
                return (
                    <motion.a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{
                            scale: 1.15,
                            x: -4,
                            transition: { type: "spring", stiffness: 400, damping: 20 }
                        }}
                        className="flex items-center justify-center w-11 h-11 text-sky-text-secondary/60 hover:text-sky-primary dark:hover:text-sky-primary transition-colors duration-300 dark:hover:drop-shadow-[0_0_12px_rgba(162,207,254,0.9)]"
                        aria-label={link.name}
                    >
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.a>
                );
            })}
        </div>
    );
}
