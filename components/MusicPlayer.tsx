"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface MusicPlayerProps {
    className?: string;
}

export default function MusicPlayer({ className = "" }: MusicPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Optional: Try to auto-play on low volume if allowed
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.3; // Start at 30% volume
        }
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.log("Playback prevented:", error);
                    });
                }
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className={`z-50 ${className}`}>
            <audio
                ref={audioRef}
                src="/audio/background-music.mp3"
                loop
                preload="auto"
            />

            <motion.button
                onClick={togglePlay}
                className={`group flex items-center gap-3 px-4 py-3 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${isPlaying
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/80 text-muted-foreground border-border hover:bg-background"
                    }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="relative">
                    {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    {isPlaying && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                    )}
                </div>

                <div className="overflow-hidden w-0 group-hover:w-28 transition-all duration-500 ease-in-out whitespace-nowrap">
                    <span className={`text-sm font-medium ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100`}>
                        {isPlaying ? "Pause Music" : "Play Music"}
                    </span>
                </div>
            </motion.button>
        </div>
    );
}
