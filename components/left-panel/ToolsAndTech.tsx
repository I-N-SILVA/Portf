"use client";

import { motion } from "framer-motion";
import { textRevealVariants } from "@/lib/animations";

const techStack = {
  Languages: ["Python", "JavaScript", "TypeScript", "Solidity"],
  Frameworks: ["React", "Next.js", "React Native"],
  "AI/ML": ["Claude API", "GPT-4", "Anthropic API"],
  Tools: ["Cursor", "Bolt.new", "Zapier"],
  Databases: ["Supabase", "PostgreSQL", "Firebase", "Airtable"],
  Web3: ["Web3.js", "Ethers.js", "The Graph"],
  Other: ["FastAPI", "Redux", "D3.js", "Notion API"],
};

export default function ToolsAndTech() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Tools & Tech Stack</h2>
      {Object.entries(techStack).map(([category, tools], index) => (
        <motion.div
          key={category}
          className="mb-4"
          variants={textRevealVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
        >
          <h3 className="text-lg font-semibold text-neonPink mb-2">{category}</h3>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
