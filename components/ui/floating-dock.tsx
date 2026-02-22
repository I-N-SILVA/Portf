"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Home, User, FolderKanban, Sparkles, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Home", href: "#hero", icon: Home },
    { name: "About", href: "#about", icon: User },
    { name: "Projects", href: "#projects", icon: FolderKanban },
    { name: "Expertise", href: "#expertise", icon: Sparkles },
    { name: "Contact", href: "#contact", icon: Mail },
]

function NavIcon({ item, hoveredIndex, index, activeSection, setHoveredIndex, scrollToSection }: any) {
    const ref = useRef<HTMLAnchorElement>(null)
    const mouseX = useMotionValue(Infinity)
    const Icon = item.icon
    const isActive = activeSection === item.href.replace("#", "")

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 }
        return val - bounds.y - bounds.height / 2
    })

    const widthSync = useTransform(distance, [-150, 0, 150], [48, 80, 48])
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

    return (
        <motion.a
            ref={ref}
            href={item.href}
            onMouseMove={(e) => mouseX.set(e.pageY)}
            onClick={(e) => scrollToSection(e, item.href)}
            style={{ height: width }}
            className="group relative flex items-center justify-center w-12 rounded-full transition-colors duration-300"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => {
                setHoveredIndex(null)
                mouseX.set(Infinity)
            }}
            aria-label={item.name}
        >
            <span
                className={cn(
                    "absolute inset-1 rounded-full transition-all duration-300 ease-out",
                    hoveredIndex === index ? "bg-sky-primary/20 scale-100 opacity-100 shadow-sky-glow" : "scale-75 opacity-0",
                    isActive && "bg-sky-primary/10 opacity-100 scale-100 shadow-sky-glow"
                )}
            />

            <span
                className={cn(
                    "relative z-10 transition-all duration-300 ease-out",
                    hoveredIndex === index || isActive ? "text-sky-primary scale-110" : "text-sky-text-secondary opacity-60"
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
                        className="absolute left-full ml-4 px-3 py-1.5 rounded-card bg-card/90 backdrop-blur-md border border-sky-border/20 text-sky-text-primary text-[11px] font-bold tracking-[0.1em] uppercase whitespace-nowrap shadow-sky-glow pointer-events-none z-[110]"
                    >
                        {item.name}
                        <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 size-2 rotate-45 bg-card/90 border-l border-b border-sky-border/20 shadow-[-2px_2px_4px_rgba(162,207,254,0.1)]" />
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Active Indicator */}
            {isActive && (
                <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute -left-1 w-1 h-5 rounded-full bg-sky-primary shadow-sky-glow"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </motion.a>
    )
}

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
            <div className="relative flex flex-col items-center gap-2 px-1.5 py-3 rounded-full bg-card/80 backdrop-blur-xl border border-sky-border/20 shadow-standard dark:shadow-elevated">
                {navItems.map((item, index) => (
                    <NavIcon
                        key={item.name}
                        item={item}
                        index={index}
                        hoveredIndex={hoveredIndex}
                        activeSection={activeSection}
                        setHoveredIndex={setHoveredIndex}
                        scrollToSection={scrollToSection}
                    />
                ))}
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
                                    isActive ? "bg-sky-primary/10 scale-100 shadow-sky-glow" : "scale-50 opacity-0"
                                )}
                            />
                            <Icon size={20} className={cn("relative z-10", isActive ? "text-sky-primary" : "text-sky-text-secondary opacity-60")} />
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
