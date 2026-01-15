"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AboutMe from "./AboutMe";
import ToolsAndTech from "./ToolsAndTech";
import Skills from "./Skills";
import Contact from "./Contact";

const navItems = ["About Me", "Tools & Tech Stack", "Skills", "Contact"];

const contentComponents: { [key: string]: React.ComponentType } = {
  "About Me": AboutMe,
  "Tools & Tech Stack": ToolsAndTech,
  "Skills": Skills,
  "Contact": Contact,
};

export default function LeftPanel() {
  const [activeSection, setActiveSection] = useState("About Me");

  const ActiveComponent = contentComponents[activeSection];

  return (
    <div className="h-full flex flex-col p-8">
      <motion.h1
        className="text-6xl font-black leading-none tracking-tighter text-white font-[family-name:var(--font-outfit)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Ian N.
      </motion.h1>

      <nav className="my-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item}>
              <button
                onClick={() => setActiveSection(item)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === item
                    ? "bg-neonPink text-white"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
