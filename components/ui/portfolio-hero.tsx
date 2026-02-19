"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

// Inline Button component
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className = "", children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-accent hover:text-white dark:bg-primary dark:text-deep-cocoa-dark dark:hover:bg-accent dark:hover:text-white ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

// BlurText animation component
interface BlurTextProps {
    text: string;
    delay?: number;
    animateBy?: "words" | "letters";
    direction?: "top" | "bottom";
    className?: string;
    style?: React.CSSProperties;
}

const BlurText: React.FC<BlurTextProps> = ({
    text,
    delay = 50,
    animateBy = "words",
    direction = "top",
    className = "",
    style,
}) => {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const segments = useMemo(() => {
        return animateBy === "words" ? text.split(" ") : text.split("");
    }, [text, animateBy]);

    return (
        <p ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
            {segments.map((segment, i) => (
                <span
                    key={i}
                    style={{
                        display: "inline-block",
                        filter: inView ? "blur(0px)" : "blur(10px)",
                        opacity: inView ? 1 : 0,
                        transform: inView ? "translateY(0)" : `translateY(${direction === "top" ? "-20px" : "20px"})`,
                        transition: `all 0.5s ease-out ${i * delay}ms`,
                    }}
                >
                    {segment}
                    {animateBy === "words" && i < segments.length - 1 ? "\u00A0" : ""}
                </span>
            ))}
        </p>
    );
};

const BackgroundMesh = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.6]">
            {/* Animated Gradient Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -50, 0],
                    y: [0, -40, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full"
            />

            {/* Mesh Grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, var(--border) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
                }}
            />
        </div>
    );
};

export default function PortfolioHero() {
    const [isDark, setIsDark] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        document.documentElement.classList.add("dark");

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMenuOpen &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const menuItems = [
        { label: "HOME", href: "#hero", highlight: true },
        { label: "ABOUT", href: "#about" },
        { label: "PROJECTS", href: "#projects" },
        { label: "TOOLS", href: "#tools" },
        { label: "CONTACT", href: "#contact" },
    ];

    return (
        <div
            className="min-h-screen text-foreground transition-colors bg-transparent relative"
        >
            <BackgroundMesh />

            {/* Spotlight that follows cursor */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-10 transition-colors"
                animate={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--primary-5), transparent 80%)`,
                }}
                style={{
                    // Explicitly inject a very low alpha primary color via CSS variable hack or just low opacity
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--primary-rgb), 0.05), transparent 80%)`
                } as any}
            />
            {/* Header - Minimalist (Theme Toggle Only) */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 pointer-events-none">
                <nav className="flex items-center justify-end max-w-screen-2xl mx-auto">
                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTheme();
                        }}
                        className="relative w-16 h-8 rounded-full hover:opacity-80 transition-opacity pointer-events-auto bg-muted dark:bg-secondary"
                        aria-label="Toggle theme"
                    >
                        <div
                            className="absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 bg-foreground dark:bg-primary-foreground"
                            style={{
                                transform: isDark ? "translateX(2rem)" : "translateX(0)",
                            }}
                        />
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative min-h-screen flex flex-col">
                {/* Centered Main Name - Always Perfectly Centered */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
                    <div className="relative text-center">
                        <div>
                            <BlurText
                                text="IAN N."
                                delay={100}
                                animateBy="letters"
                                direction="top"
                                className="font-black text-[56px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[210px] leading-[0.75] tracking-tighter uppercase justify-center whitespace-nowrap"
                                style={{ color: "var(--primary)", fontFamily: "var(--font-outfit)" }}
                            />
                        </div>
                        <div>
                            <BlurText
                                text="SILVA"
                                delay={100}
                                animateBy="letters"
                                direction="top"
                                className="font-black text-[56px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[210px] leading-[0.75] tracking-tighter uppercase justify-center whitespace-nowrap"
                                style={{ color: "var(--primary)", fontFamily: "var(--font-outfit)" }}
                            />
                        </div>

                        {/* Profile Picture / Logo replacement */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-background border border-border flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <img
                                    src="/favicon-32x32.png"
                                    alt="Profile Logo"
                                    className="w-1/2 h-1/2 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tagline - Proper Distance Below Hero */}
                <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-32 xl:bottom-36 left-1/2 -translate-x-1/2 w-full px-6">
                    <div className="flex justify-center">
                        <BlurText
                            text="Designing human experiences in code."
                            delay={150}
                            animateBy="words"
                            direction="top"
                            className="text-[15px] sm:text-[18px] md:text-[20px] lg:text-[22px] text-center transition-colors duration-300 text-foreground hover:text-accent"
                            style={{ fontFamily: "var(--font-inter)" }}
                        />
                    </div>
                </div>

                {/* Scroll Indicator */}
                <button
                    type="button"
                    className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 transition-colors duration-300 pointer-events-auto"
                    aria-label="Scroll down"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ChevronDown className="w-5 h-5 md:w-8 md:h-8 text-foreground hover:text-accent transition-colors duration-300" />
                </button>
            </main>
        </div>
    );
}
