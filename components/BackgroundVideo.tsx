"use client";

import { useEffect, useRef, useState, memo } from "react";

interface BackgroundVideoProps {
  src: string;
  opacity?: number;
  blur?: number;
}

const BackgroundVideo = memo(function BackgroundVideo({
  src,
  opacity = 0.15,
  blur = 0,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reduce playback rate for performance
    video.playbackRate = 0.8;

    if (video.readyState >= 3) {
      setIsLoaded(true);
      video.play().catch((err) => console.warn("Auto-play failed:", err));
    }

    const handleCanPlay = () => {
      console.log("Video can play!");
      setIsLoaded(true);
      video.play().catch((err) => {
        console.warn("Video autoplay failed:", err);
      });
    };

    const handleError = (e: any) => {
      console.error("Video error:", video.error, e);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Pause when tab is hidden (save battery/performance)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => { });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
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
          opacity: isLoaded ? opacity : 0,
          filter: blur > 0 ? `blur(${blur}px)` : "none",
          transition: "opacity 0.5s ease-in-out",
        }}
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Gradient overlay to blend video with design */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-deepBlack/50 via-transparent to-deepBlack/50"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
});

export default BackgroundVideo;
