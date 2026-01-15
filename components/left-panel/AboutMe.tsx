"use client";

import { motion } from "framer-motion";
import { textRevealVariants } from "@/lib/animations";

const profileData = {
  title: "AI Automation Engineer & Behavioral Economist",
  bio: "I build intelligent systems and leverage insights from behavioral science to create compelling user experiences. My passion lies at the intersection of human psychology and cutting-edge technology.",
  education: "BA Economics | MSc Psychology (Merit, 65%) | Arden University",
  currentStatus: "Currently: Building PLYAZ | Exploring AI Agents & MCP | £10K MRR Goal",
};

export default function AboutMe() {
  return (
    <div>
      <motion.p
        className="mt-8 text-xl md:text-2xl text-lightGray max-w-lg"
        variants={textRevealVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        {profileData.title}
      </motion.p>

      <motion.p
        className="mt-4 text-sm md:text-base text-gray-400 max-w-md"
        variants={textRevealVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        {profileData.bio}
      </motion.p>

      <motion.p
        className="mt-6 text-xs md:text-sm text-gray-500 font-semibold max-w-md"
        variants={textRevealVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
      >
        {profileData.education}
      </motion.p>

      <motion.div
        className="mt-4 inline-block"
        variants={textRevealVariants}
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
