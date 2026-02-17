"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Color Palette
const COLORS = {
    BRAND_LIME: "#C3E41D",
    DEEP_VIOLET: "#6958d5",
    ELECTRIC_BLUE: "#60aed5",
    IGNITE_GLOW: "#ffffff"
};

interface TubesBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    enableClickInteraction?: boolean;
}

export function TubesBackground({
    children,
    className,
    enableClickInteraction = true
}: TubesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tubesRef = useRef<any>(null);
    const [isIgnited, setIsIgnited] = useState(false);

    // Check if mouse is over Ian N. Silva text (simplified logic for now)
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!tubesRef.current) return;

        // We can potentially pass bounding boxes of the name here for precise ignition
        // For now, let's use a simpler heuristic or just follow mouse movement
    }, []);

    useEffect(() => {
        let mounted = true;
        let cleanup: (() => void) | undefined;

        const initTubes = async () => {
            if (!canvasRef.current) return;

            try {
                // Dynamic import with webpackIgnore to prevent build-time errors
                // @ts-ignore
                const tubesModule = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
                const TubesCursor = tubesModule.default;

                if (!mounted) return;

                // Custom instance configuration for "Silva Flow"
                const app = TubesCursor(canvasRef.current, {
                    tubes: {
                        colors: [COLORS.BRAND_LIME, COLORS.DEEP_VIOLET, "#444444"],
                        lights: {
                            intensity: 300,
                            colors: [COLORS.BRAND_LIME, COLORS.ELECTRIC_BLUE, "#ff008a", "#000000"]
                        }
                    }
                });

                tubesRef.current = app;

                cleanup = () => {
                    if (canvasRef.current) {
                        const gl = canvasRef.current.getContext('webgl2') || canvasRef.current.getContext('webgl');
                        if (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext) {
                            const extension = gl.getExtension('WEBGL_lose_context');
                            if (extension) extension.loseContext();
                        }
                    }
                };

            } catch (error) {
                console.error("Failed to load Silva Flow (TubesCursor):", error);
            }
        };

        initTubes();

        return () => {
            mounted = false;
            if (cleanup) cleanup();
        };
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        if (!enableClickInteraction || !tubesRef.current) return;

        // "Spatial Push" - Randomize and "explode" colors
        const colors = [COLORS.BRAND_LIME, COLORS.IGNITE_GLOW, COLORS.ELECTRIC_BLUE];
        const lightsColors = [COLORS.ELECTRIC_BLUE, "#ffffff", "#000000", COLORS.BRAND_LIME];

        tubesRef.current.tubes.setColors(colors);
        tubesRef.current.tubes.setLightsColors(lightsColors);

        // Reset back to brand defaults after a delay
        setTimeout(() => {
            if (tubesRef.current) {
                tubesRef.current.tubes.setColors([COLORS.BRAND_LIME, COLORS.DEEP_VIOLET, "#444444"]);
                tubesRef.current.tubes.setLightsColors([COLORS.BRAND_LIME, COLORS.ELECTRIC_BLUE, "#ff008a", "#000000"]);
            }
        }, 1500);
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full min-h-screen overflow-hidden bg-[#0a0a0a] ${className || ""}`}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block opacity-70"
                style={{ touchAction: 'none' }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}

export default TubesBackground;
