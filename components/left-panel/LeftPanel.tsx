"use client";

import { useState, useCallback, memo } from "react";
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

const LeftPanel = memo(function LeftPanel() {
  const [activeSection, setActiveSection] = useState("About Me");

  const handleNavClick = useCallback((item: string) => {
    setActiveSection(item);
  }, []);

  const ActiveComponent = contentComponents[activeSection];

  return (
    <div className="h-full flex flex-col p-8">
      <h1 className="text-6xl font-black leading-none tracking-tighter text-foreground font-[family-name:var(--font-outfit)]">
        Ian N. <span className="text-primary">Silva</span>
      </h1>

      <nav className="my-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item}>
              <motion.button
                onClick={() => handleNavClick(item)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 font-medium ${activeSection === item
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {item}
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

export default LeftPanel;
