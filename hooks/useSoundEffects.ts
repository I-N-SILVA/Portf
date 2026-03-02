"use client";

import { useCallback, useRef, useEffect } from "react";

type SoundType = "focus" | "close" | "maximize" | "minimize";

export function useSoundEffects() {
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext on first interaction
    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
    }, []);

    useEffect(() => {
        // Initialize on first user interaction to comply with browser autoplay policies
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
            // Fallback initialization if it hasn't happened yet
            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext();
            }

            const ctx = audioContextRef.current;
            if (ctx.state === "suspended") ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;
            // Extremely subtle volume for UI sounds
            const maxVol = 0.05;

            if (type === "focus") {
                // High pitch, very short click for focusing a window
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain.gain.setValueAtTime(maxVol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === "close") {
                // Low pitch, slightly longer "pop" for closing
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(maxVol * 1.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === "maximize") {
                // Ascending bright sweep
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(maxVol, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === "minimize") {
                // Descending sweep
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
            // Silently fail if Web Audio API is blocked or unsupported
            console.warn("Sound effect playback failed.");
        }
    }, []);

    return { playSound };
}
