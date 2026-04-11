"use client";

import { useCallback, useRef, useEffect } from "react";

type SoundType = "focus" | "close" | "maximize" | "minimize" | "click" | "shutter" | "hum" | "glitch";

export function useSoundEffects() {
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext on first interaction
    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
    }, []);

    useEffect(() => {
        const handleInteraction = () => initAudio();
        window.addEventListener("pointerdown", handleInteraction, { once: true });
        window.addEventListener("keydown", handleInteraction, { once: true });
        return () => {
            window.removeEventListener("pointerdown", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
        };
    }, [initAudio]);

    const playSound = useCallback((type: SoundType) => {
        if (typeof window === "undefined") return;

        try {
            if (!audioContextRef.current) {
                const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext();
            }

            const ctx = audioContextRef.current;
            if (ctx.state === "suspended") ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;
            const maxVol = 0.05;

            if (type === "focus" || type === "click") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain.gain.setValueAtTime(maxVol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === "close") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(maxVol * 1.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === "shutter") {
                // Dual tone for mechanical shutter feel
                const osc2 = ctx.createOscillator();
                osc2.type = "square";
                osc2.frequency.setValueAtTime(120, now);
                osc2.connect(gain);
                
                osc.type = "triangle";
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                
                gain.gain.setValueAtTime(maxVol * 0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                
                osc.start(now);
                osc.stop(now + 0.08);
                osc2.start(now);
                osc2.stop(now + 0.08);
            } else if (type === "hum") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(60, now);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(maxVol * 0.5, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === "glitch") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.setValueAtTime(800, now + 0.02);
                osc.frequency.setValueAtTime(300, now + 0.04);
                gain.gain.setValueAtTime(maxVol * 0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
            } else if (type === "maximize") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(maxVol, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === "minimize") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(maxVol, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            }
        } catch (e) {
            console.warn("Sound effect playback failed.");
        }
    }, []);

    return { playSound };
}
