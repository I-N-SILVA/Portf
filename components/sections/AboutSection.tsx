"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { profileData } from "@/lib/placeholder-content";
import { User, MapPin, GraduationCap, Zap } from "lucide-react";
import React from "react";
import Image from "next/image";
import { KineticText } from "@/components/ui/KineticText";

function TiltCard({ children, className, colSpan = "" }: { children: React.ReactNode; className?: string; colSpan?: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`${colSpan} perspective-1000`}
        >
            <div
                className={className}
                style={{
                    transform: "translateZ(50px)",
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
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col"
                    >
                        <span className="text-secondary-foreground/40 font-mono text-sm mb-2 tracking-widest uppercase">01 / IDENTITY</span>
                        <KineticText intensity={0.5}>
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] font-[family-name:var(--font-outfit)]">
                                THE<br />PROFILE
                            </h2>
                        </KineticText>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[600px]">
                    {/* Main Bio Card */}
                    <TiltCard
                        colSpan="md:col-span-2 md:row-span-2"
                        className="h-full bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/20 rounded-card p-6 sm:p-8 md:p-12 flex flex-col justify-between group hover:border-sky-primary/50 transition-colors duration-500 overflow-hidden relative shadow-standard dark:shadow-elevated"
                    >
                        <div className="relative z-10">
                            <User className="w-10 h-10 md:w-12 md:h-12 text-sky-primary mb-6 md:mb-8 dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.4)]" />
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight text-sky-text-primary font-[family-name:var(--font-outfit)]">
                                {profileData.tagline}
                            </h3>
                            <p className="text-base md:text-lg text-sky-text-secondary leading-relaxed max-w-md">
                                {profileData.bio}
                            </p>

                            <div className="mt-8">
                                <div className="text-xs text-sky-text-secondary italic font-medium">
                                    Current Location: {profileData.location}
                                </div>
                            </div>
                        </div>

                        {/* Avatar/Photo Placement */}
                        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Image
                                src="/android-chrome-512x512.png"
                                alt="Ian Portrait"
                                width={512}
                                height={512}
                                className="object-cover grayscale"
                            />
                        </div>
                    </TiltCard>

                    {/* Location Card */}
                    <TiltCard
                        className="bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/20 rounded-card p-6 md:p-8 flex flex-col justify-between group hover:border-sky-primary/50 transition-colors duration-500 h-full shadow-standard dark:shadow-elevated"
                    >
                        <MapPin className="w-8 h-8 text-sky-primary/70 group-hover:text-sky-primary transition-colors dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.4)]" />
                        <div>
                            <p className="text-sm text-sky-text-secondary mb-1 uppercase tracking-widest font-bold">Location</p>
                            <p className="text-xl md:text-2xl font-bold text-sky-text-primary uppercase font-[family-name:var(--font-outfit)]">{profileData.location}</p>
                        </div>
                    </TiltCard>

                    {/* Experience/Education Card */}
                    <TiltCard
                        className="bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/20 rounded-card p-6 md:p-8 flex flex-col justify-between group hover:border-sky-primary/50 transition-colors duration-500 h-full shadow-standard dark:shadow-elevated"
                    >
                        <GraduationCap className="w-8 h-8 text-sky-primary/70 group-hover:text-sky-primary transition-colors dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.4)]" />
                        <div>
                            <p className="text-sm text-sky-text-secondary mb-1 uppercase tracking-widest font-bold">Background</p>
                            <p className="text-xl md:text-2xl font-bold text-sky-text-primary uppercase font-[family-name:var(--font-outfit)]">Econ & Psychology</p>
                        </div>
                    </TiltCard>

                    {/* Quick Stats/Status Card */}
                    <TiltCard
                        colSpan="md:col-span-2"
                        className="bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/20 rounded-card p-6 md:p-10 flex items-center justify-between group hover:border-sky-primary/50 transition-colors duration-500 h-full overflow-hidden relative shadow-standard dark:shadow-elevated"
                    >
                        <div className="relative z-10">
                            <p className="text-sm text-sky-text-secondary mb-2 uppercase tracking-widest font-bold">Current Focus</p>
                            <h4 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-sky-text-primary uppercase font-[family-name:var(--font-outfit)]">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-primary"></span>
                                </span>
                                Building AI Products
                            </h4>
                        </div>
                        <Zap className="w-16 h-16 md:w-24 md:h-24 text-sky-primary/5 absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-sky-primary/10 transition-colors" />
                    </TiltCard>
                </div>
            </div>
        </section>
    );
}
