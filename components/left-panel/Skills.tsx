"use client";

import { motion } from "framer-motion";
import { textRevealVariants } from "@/lib/animations";

const skills = [
  "AI Automation & Agent Development",
  "Full-Stack Development",
  "Behavioral Economics",
  "Web3 & Blockchain",
  "Product Strategy",
  "Rapid Prototyping",
];

export default function Skills() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Skills</h2>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <motion.li
            key={skill}
            className="text-gray-300"
            variants={textRevealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            {skill}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
