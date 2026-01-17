"use client";

import { motion } from "framer-motion";
import { memo } from "react";

// Use CSS animations instead of Framer Motion for better performance
const GradientBlobs = memo(function GradientBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Main background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-deepBlack via-charcoalGray to-deepBlack" />

      {/* Animated gradient blobs using CSS animations for better performance */}
      <div
        className="absolute top-0 -left-20 w-96 h-96 rounded-full opacity-30 blur-3xl animate-blob"
        style={{
          background: "radial-gradient(circle, #ff006e 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-blob"
        style={{
          background: "radial-gradient(circle, #8338ec 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />

      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-25 blur-3xl animate-blob"
        style={{
          background: "radial-gradient(circle, #3a86ff 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
});

export default GradientBlobs;
