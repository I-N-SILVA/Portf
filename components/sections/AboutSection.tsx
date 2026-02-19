"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { profileData } from "@/lib/placeholder-content";
import { User, MapPin, GraduationCap, Zap } from "lucide-react";
import React from "react";

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
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">WHO IS IAN?</h2>
                        <div className="h-1 w-20 bg-primary rounded-full" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[600px]">
                    {/* Main Bio Card */}
                    <TiltCard
                        colSpan="md:col-span-2 md:row-span-2"
                        className="h-full bg-card border border-border rounded-[24px] md:rounded-[32px] p-6 sm:p-8 md:p-12 flex flex-col justify-between group hover:border-primary/50 transition-colors duration-500 overflow-hidden relative"
                    >
                        <div className="relative z-10">
                            <User className="w-10 h-10 md:w-12 md:h-12 text-primary mb-6 md:mb-8" />
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight">
                                {profileData.tagline}
                            </h3>
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
                                {profileData.bio}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    </TiltCard>

                    {/* Location Card */}
                    <TiltCard
                        className="bg-card border border-border rounded-[24px] p-6 md:p-8 flex flex-col justify-between group hover:border-primary/50 transition-colors duration-500 h-full"
                    >
                        <MapPin className="w-8 h-8 text-primary/70 group-hover:text-primary transition-colors" />
                        <div>
                            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">Location</p>
                            <p className="text-xl md:text-2xl font-bold">{profileData.location}</p>
                        </div>
                    </TiltCard>

                    {/* Experience/Education Card */}
                    <TiltCard
                        className="bg-card border border-border rounded-[24px] p-6 md:p-8 flex flex-col justify-between group hover:border-primary/50 transition-colors duration-500 h-full"
                    >
                        <GraduationCap className="w-8 h-8 text-primary/70 group-hover:text-primary transition-colors" />
                        <div>
                            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">Background</p>
                            <p className="text-xl md:text-2xl font-bold">Econ & Design</p>
                        </div>
                    </TiltCard>

                    {/* Quick Stats/Status Card */}
                    <TiltCard
                        colSpan="md:col-span-2"
                        className="bg-card border border-border rounded-[24px] p-6 md:p-10 flex items-center justify-between group hover:border-primary/50 transition-colors duration-500 h-full overflow-hidden relative"
                    >
                        <div className="relative z-10">
                            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-widest font-bold">Current Focus</p>
                            <h4 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                                Building AI Products
                            </h4>
                        </div>
                        <Zap className="w-16 h-16 md:w-24 md:h-24 text-primary/5 absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-primary/10 transition-colors" />
                    </TiltCard>
                </div>
            </div>
        </section>
    );
}
