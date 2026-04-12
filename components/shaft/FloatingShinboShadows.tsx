"use client";

import { motion } from "framer-motion";

export default function FloatingShinboShadows() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden opacity-[0.03] grayscale">
      {/* Power lines shadow */}
      <motion.div
        animate={{ 
          x: [-20, 20],
          y: [-10, 10],
          rotate: [0, 2]
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          repeatType: "mirror",
          ease: "linear" 
        }}
        className="absolute top-1/4 -left-1/4 w-[150%] h-1 bg-black/40 blur-sm"
        style={{ rotate: "-15deg" }}
      />
      <motion.div
        animate={{ 
          x: [20, -20],
          y: [10, -10],
          rotate: [0, -2]
        }}
        transition={{ 
          duration: 35, 
          repeat: Infinity, 
          repeatType: "mirror",
          ease: "linear" 
        }}
        className="absolute top-[30%] -left-1/4 w-[150%] h-0.5 bg-black/40 blur-sm"
        style={{ rotate: "-12deg" }}
      />

      {/* Window frame shadow */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-0 right-0 w-[40vw] h-[60vh] border-[40px] border-black/30 blur-xl rounded-sm"
      />
    </div>
  );
}
