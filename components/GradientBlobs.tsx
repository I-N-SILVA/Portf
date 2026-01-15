"use client";

import { motion } from "framer-motion";
import { blobVariants } from "@/lib/animations";

export default function GradientBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Main background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-deepBlack via-charcoalGray to-deepBlack" />

      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-0 -left-20 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, #ff006e 0%, transparent 70%)",
        }}
        variants={blobVariants}
        initial="initial"
        animate="animate"
      />

      <motion.div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8338ec 0%, transparent 70%)",
        }}
        variants={blobVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 1, duration: 12 }}
      />

      <motion.div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-25 blur-3xl"
        style={{
          background: "radial-gradient(circle, #3a86ff 0%, transparent 70%)",
        }}
        variants={blobVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 2, duration: 14 }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #ffbe0b 0%, transparent 70%)",
        }}
        variants={blobVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5, duration: 10 }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, #06ffa5 0%, transparent 70%)",
        }}
        variants={blobVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 1.5, duration: 11 }}
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
}
