"use client";

import { useEffect, useRef } from "react";

interface BackgroundVideoProps {
  src: string; // Path to video file, e.g., "/videos/background.mp4"
  opacity?: number; // 0-1, default 0.15 (15%)
  blur?: number; // 0-10, default 0 (no blur)
}

export default function BackgroundVideo({
  src,
  opacity = 0.15,
  blur = 0,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Play video when mounted
    video.play().catch((err) => {
      console.warn("Video autoplay failed:", err);
    });

    // Pause when tab is hidden (save battery/performance)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover"
        style={{
          transform: "translate(-50%, -50%)",
          opacity: opacity,
          filter: blur > 0 ? `blur(${blur}px)` : "none",
          willChange: "auto", // Optimize performance
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={src} type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="w-full h-full bg-deepBlack" />
      </video>

      {/* Gradient overlay to blend video with design */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-deepBlack/50 via-transparent to-deepBlack/50"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}
