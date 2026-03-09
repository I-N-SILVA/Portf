"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { profileData } from "@/lib/placeholder-content";
import { MapPin, GraduationCap, Zap } from "lucide-react";
import React from "react";
import Image from "next/image";
import { KineticText } from "@/components/ui/KineticText";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function TiltCard({ children, className, colSpan = "" }: { children: React.ReactNode; className?: string; colSpan?: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: isMobile ? 0 : rotateX,
                rotateY: isMobile ? 0 : rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`${colSpan} perspective-1000`}
        >
            <div
                className={className}
                style={{
                    transform: isMobile ? "none" : "translateZ(50px)",
                    transformStyle: "preserve-3d",
                }}
            >
                {children}
            </div>
        </motion.div>
    );
}

export default function AboutSection() {
    return (
        <section id="about" className="py-16 md:py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header */}
                <div className="flex flex-col mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col"
                    >
                        <span className="text-secondary-foreground/40 font-mono text-sm mb-2 tracking-widest uppercase">01 / IDENTITY</span>
                        <KineticText intensity={0.5}>
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] font-syne">
                                THE<br />PROFILE
                            </h2>
                        </KineticText>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">

                    {/* Hero Bio Card — spans left 7 columns, full height */}
                    <TiltCard
                        colSpan="md:col-span-7 md:row-span-2"
                        className="h-full min-h-[400px] md:min-h-[550px] bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/20 rounded-card p-8 md:p-12 flex flex-col justify-between group hover:border-sky-primary/50 transition-colors duration-500 overflow-hidden relative shadow-standard dark:shadow-elevated"
                    >
                        {/* Ambient glow */}
                        <div className="absolute -top-20 -left-20 size-80 bg-sky-primary/10 blur-[100px] group-hover:bg-sky-primary/20 transition-colors duration-700 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full">
                            {/* Top: Badge + Name */}
                            <div className="mb-auto">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-3 mb-6"
                                >
                                    <div className="size-2 rounded-full bg-sky-primary animate-pulse shadow-[0_0_8px_rgba(162,207,254,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-primary/60 font-mono">System Profile</span>
                                </motion.div>

                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl sm:text-5xl md:text-6xl font-black leading-[0.85] tracking-tight text-sky-text-primary font-syne mb-6"
                                >
                                    {profileData.name}
                                </motion.h3>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg md:text-xl font-bold text-sky-primary/80 mb-6 uppercase tracking-wider"
                                >
                                    {profileData.tagline}
                                </motion.p>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg md:text-xl text-sky-text-secondary/90 leading-relaxed max-w-xl font-medium"
                                >
                                    {profileData.bio}
                                </motion.p>
                            </div>
                        </div>

                        {/* Watermark Logo */}
                        <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none" aria-hidden="true">
                            <Image
                                src="/android-chrome-512x512.png"
                                alt=""
                                width={512}
                                height={512}
                                sizes="(max-width: 768px) 192px, 256px"
                                loading="lazy"
                                className="object-cover grayscale"
                            />
                        </div>
                    </TiltCard>

                    {/* Right Column — stacks vertically in 5 cols */}
                    {/* Location Card */}
                    <TiltCard
                        colSpan="md:col-span-5"
                        className="bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/20 rounded-card p-6 md:p-8 flex flex-col justify-between group hover:border-sky-primary/50 transition-colors duration-500 h-full min-h-[160px] shadow-standard dark:shadow-elevated relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between">
                            <MapPin className="w-8 h-8 text-sky-primary/70 group-hover:text-sky-primary transition-colors dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.4)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-sky-text-secondary/20 font-mono">02</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-sky-text-secondary/50 mb-1 uppercase tracking-[0.3em] font-black">Location</p>
                            <p className="text-2xl md:text-3xl font-black text-sky-text-primary uppercase font-syne tracking-tight">{profileData.location}</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-primary/0 via-sky-primary/20 to-sky-primary/0 group-hover:via-sky-primary/50 transition-all duration-500" />
                    </TiltCard>

                    {/* Background & Focus Card — combined into one wider card */}
                    <TiltCard
                        colSpan="md:col-span-5"
                        className="bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/20 rounded-card p-6 md:p-8 group hover:border-sky-primary/50 transition-colors duration-500 h-full min-h-[160px] shadow-standard dark:shadow-elevated relative overflow-hidden"
                    >
                        <div className="flex flex-col sm:flex-row gap-6 h-full">
                            {/* Credentials */}
                            <div className="flex flex-col justify-between flex-1">
                                <GraduationCap className="w-7 h-7 text-sky-primary/70 group-hover:text-sky-primary transition-colors dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.4)] mb-4" />
                                <div>
                                    <p className="text-[10px] text-sky-text-secondary/50 mb-1 uppercase tracking-[0.3em] font-black">Background</p>
                                    <p className="text-lg md:text-xl font-black text-sky-text-primary uppercase font-syne tracking-tight leading-tight">Economics & Psychology</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden sm:block w-px bg-sky-border/10 self-stretch" />
                            <div className="block sm:hidden h-px bg-sky-border/10 w-full" />

                            {/* Current Focus */}
                            <div className="flex flex-col justify-between flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <Zap className="w-7 h-7 text-sky-primary/70 group-hover:text-sky-primary transition-colors dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.4)]" />
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-sky-text-secondary/50 mb-1 uppercase tracking-[0.3em] font-black">Current Focus</p>
                                    <p className="text-lg md:text-xl font-black text-sky-text-primary uppercase font-syne tracking-tight">Building AI Products</p>
                                    <p className="text-[11px] text-sky-text-secondary/50 mt-1 font-mono font-bold">AI Agents • MCP • Automation</p>
                                </div>
                            </div>
                        </div>

                        {/* Decorative gradient line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-primary/0 via-green-400/30 to-sky-primary/0 group-hover:via-green-400/60 transition-all duration-500" />
                    </TiltCard>
                </div>
            </div>
        </section>
    );
}
