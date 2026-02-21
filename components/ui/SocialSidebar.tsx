"use client";

import React from "react";
import { motion } from "framer-motion";
import { Instagram, Youtube, Twitter, Linkedin, Github } from "lucide-react";
import { socialLinks } from "@/lib/placeholder-content";

// TikTok icon is often missing in standard Lucide sets, providing a simple SVG
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        stroke="none"
    >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13 3.35-.11 6.71-.12 10.06-.03 2.1-.8 4.31-2.43 5.68-1.76 1.48-4.4 1.9-6.59 1.12-2.31-.83-4.13-2.96-4.52-5.41-.42-2.65.65-5.59 2.89-7.14 1.42-1 3.23-1.41 4.93-1.07V12.9c-1.34-.33-2.88-.1-3.92.83-1.03.92-1.43 2.44-1.12 3.78.36 1.5 1.77 2.66 3.29 2.62 1.55-.06 2.87-1.32 2.99-2.87.03-3.32.01-6.64.02-9.97a9.14 9.14 0 0 0-3.31-6.81l.01-4c2.44.22 4.7 1.58 5.76 3.79l.01-4.21c-.42-.09-.84-.17-1.26-.26a9.41 9.41 0 0 0-4.52.02V.02Z" />
    </svg>
);

const iconMap: Record<string, any> = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    tiktok: TikTokIcon,
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
                        whileHover={{ scale: 1.2, x: -2 }}
                        className="text-foreground/60 hover:text-primary transition-all duration-300"
                        aria-label={link.name}
                    >
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.a>
                );
            })}
        </div>
    );
}
