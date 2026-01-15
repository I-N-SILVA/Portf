"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { navItems } from "@/lib/placeholder-content";
import { navItemVariants } from "@/lib/animations";
import { toggleMute, isMuted } from "@/lib/sounds";

interface NavigationProps {
  onConnectClick?: () => void;
  onSkillsClick?: () => void;
}

export default function Navigation({ onConnectClick, onSkillsClick }: NavigationProps) {
  const [activeSection, setActiveSection] = useState("hero");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
  }, []);

  const handleNavClick = (href: string, label: string) => {
    // If it's the Connect button, show modal instead of scrolling
    if (label === "Connect" && onConnectClick) {
      onConnectClick();
      return;
    }

    // If it's the Skills button, show modal instead of scrolling
    if (label === "Skills" && onSkillsClick) {
      onSkillsClick();
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setActiveSection(href.replace("#", ""));
    }
  };

  const handleMuteToggle = () => {
    const newMutedState = toggleMute();
    setMuted(newMutedState);
  };

  return (
    <motion.nav
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
    >
      <div className="glass-dark rounded-full px-6 py-4 shadow-2xl">
        <ul className="flex items-center gap-2">
          {navItems.map((item, index) => {
            const isActive = activeSection === item.href.replace("#", "");

            return (
              <motion.li
                key={item.label}
                custom={index}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <button
                  onClick={() => handleNavClick(item.href, item.label)}
                  className={`
                    relative px-6 py-2 rounded-full font-semibold text-sm
                    transition-all duration-300
                    ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-neonPink to-electricPurple rounded-full -z-10"
                      layoutId="activeNav"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </button>
              </motion.li>
            );
          })}

          {/* Sound toggle */}
          <motion.li
            custom={navItems.length}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              onClick={handleMuteToggle}
              className="relative px-3 py-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={muted ? "Unmute sounds" : "Mute sounds"}
            >
              {muted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </motion.button>
          </motion.li>
        </ul>
      </div>
    </motion.nav>
  );
}
