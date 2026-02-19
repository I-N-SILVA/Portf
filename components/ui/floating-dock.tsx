"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, User, FolderKanban, Wrench, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Home", href: "#hero", icon: Home },
    { name: "About", href: "#about", icon: User },
    { name: "Projects", href: "#projects", icon: FolderKanban },
    { name: "Tools", href: "#tools", icon: Wrench },
    { name: "Contact", href: "#contact", icon: Mail },
]

export function FloatingDock() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [activeSection, setActiveSection] = useState("hero")

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { threshold: 0.5 }
        )

        navItems.forEach((item) => {
            const element = document.getElementById(item.href.replace("#", ""))
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [])

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        const targetId = href.replace("#", "")
        const elem = document.getElementById(targetId)
        elem?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[100] hidden md:block">
            <div className="relative flex flex-col items-center gap-2 px-1.5 py-3 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl">
                {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.href.replace("#", "")

                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => scrollToSection(e, item.href)}
                            className="group relative flex items-center justify-center size-12 rounded-full transition-all duration-300"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            aria-label={item.name}
                        >
                            <span
                                className={cn(
                                    "absolute inset-1 rounded-full transition-all duration-300 ease-out",
                                    hoveredIndex === index ? "bg-primary/20 scale-100 opacity-100" : "scale-75 opacity-0",
                                    isActive && "bg-primary/10 opacity-100 scale-100"
                                )}
                            />

                            <span
                                className={cn(
                                    "relative z-10 transition-all duration-300 ease-out",
                                    hoveredIndex === index || isActive ? "text-primary scale-110" : "text-muted-foreground"
                                )}
                            >
                                <Icon size={20} />
                            </span>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {hoveredIndex === index && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 10, scale: 1 }}
                                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                        className="absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-[12px] font-bold tracking-tight whitespace-nowrap shadow-xl pointer-events-none"
                                    >
                                        {item.name}
                                        <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 size-2 rotate-45 bg-card border-l border-b border-border" />
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Active Dot */}
                            {isActive && (
                                <motion.span
                                    layoutId="active-nav-dot"
                                    className="absolute -left-1 w-1 h-4 rounded-full bg-primary"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

export function MobileDock() {
    const [activeSection, setActiveSection] = useState("hero")

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { threshold: 0.5 }
        )

        navItems.forEach((item) => {
            const element = document.getElementById(item.href.replace("#", ""))
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [])

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        const targetId = href.replace("#", "")
        const elem = document.getElementById(targetId)
        elem?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/90 backdrop-blur-2xl border border-border/50 shadow-2xl">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.href.replace("#", "")

                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => scrollToSection(e, item.href)}
                            className={cn(
                                "relative flex items-center justify-center size-12 rounded-full transition-all duration-300",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                            aria-label={item.name}
                        >
                            <span
                                className={cn(
                                    "absolute inset-1 rounded-full transition-all duration-300",
                                    isActive ? "bg-primary/10 scale-100" : "scale-50 opacity-0"
                                )}
                            />
                            <Icon size={20} className="relative z-10" />
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
