"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, memo } from "react";

const quotes = [
  { text: "The obstacle is the path.", author: "Zen Proverb" },
  { text: "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.", author: "Zen Saying" },
  { text: "In the beginner's mind there are many possibilities, but in the expert's there are few.", author: "Shunryu Suzuki" },
  { text: "The way out is through.", author: "Buddhist Teaching" },
  { text: "Let go or be dragged.", author: "Zen Proverb" },
  { text: "Sitting quietly, doing nothing, spring comes, and the grass grows by itself.", author: "Matsuo Bashō" },
  { text: "When you realize nothing is lacking, the whole world belongs to you.", author: "Lao Tzu" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thích Nhất Hạnh" },
];

const PhilosophicalQuote = memo(function PhilosophicalQuote() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Delay initial render for performance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 15000); // Slower rotation - 15 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <div className="fixed bottom-8 right-8 z-40 pointer-events-none hidden lg:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          className="text-right px-6 py-3 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs text-gray-500 italic font-light">
            "{currentQuote.text}"
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            — {currentQuote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default PhilosophicalQuote;
