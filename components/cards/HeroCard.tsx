"use client";

import { motion } from "framer-motion";
import { textRevealVariants, badgeVariants } from "@/lib/animations";
import { profileData } from "@/lib/placeholder-content";

export default function HeroCard() {
  return (
    <div className="relative" id="hero">
      {/* Large typography - BIGYAY style */}
      <div className="relative">
        {/* First name line */}
        <motion.h1
          className="text-[8rem] md:text-[12rem] lg:text-[15rem] font-black leading-none tracking-tighter text-gray-800 font-[family-name:var(--font-outfit)]"
          variants={textRevealVariants}
          initial="hidden"
          animate="visible"
        >
          {profileData.name.split(" ")[0] || "YOUR"}
        </motion.h1>

        {/* Second name line */}
        <motion.h1
          className="text-[8rem] md:text-[12rem] lg:text-[15rem] font-black leading-none tracking-tighter -mt-8 md:-mt-12 lg:-mt-16 text-gray-800 font-[family-name:var(--font-outfit)]"
          variants={textRevealVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          {profileData.name.split(" ")[1] || "NAME"}
        </motion.h1>

        {/* Floating badges */}
        <motion.div
          className="absolute -top-4 -right-4 lg:-right-12"
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <span className="inline-block text-xs font-bold bg-neonPink text-white px-3 py-1.5 rounded-full shadow-glow-pink">
            AI Builder
          </span>
        </motion.div>

        <motion.div
          className="absolute top-1/3 -left-4 lg:-left-8"
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          <span className="inline-block text-xs font-bold bg-electricPurple text-white px-3 py-1.5 rounded-full shadow-glow-purple">
            {profileData.location}
          </span>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1 }}
        >
          <span className="inline-block text-xs font-bold bg-skyBlue text-white px-3 py-1.5 rounded-full shadow-glow-blue">
            Open to Projects
          </span>
        </motion.div>
      </div>

      {/* Tagline */}
      <motion.p
        className="mt-8 text-xl md:text-2xl text-lightGray max-w-lg"
        variants={textRevealVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        {profileData.tagline}
      </motion.p>

      {/* Bio */}
      <motion.p
        className="mt-4 text-sm md:text-base text-gray-400 max-w-md"
        variants={textRevealVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        {profileData.bio}
      </motion.p>

      {/* Credentials */}
      <motion.p
        className="mt-6 text-xs md:text-sm text-gray-500 font-semibold max-w-md"
        variants={textRevealVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
      >
        {profileData.credentials}
      </motion.p>

      {/* Current Status */}
      <motion.div
        className="mt-4 inline-block"
        variants={badgeVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.7 }}
      >
        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
          <p className="text-xs text-limeGreen font-semibold">
            {profileData.currentStatus}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
