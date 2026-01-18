"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const navItems = [
    { label: "About Me", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Tools & Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border py-4" : "bg-transparent py-6"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <a href="#" className="text-2xl font-bold tracking-tight">
                    Ian N. <span className="text-primary">Silva</span>
                </a>

                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        >
                            {item.label}
                            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                        </a>
                    ))}
                </nav>

                <a
                    href="#contact"
                    className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    Let&apos;s Talk
                </a>
            </div>
        </motion.header>
    );
}
