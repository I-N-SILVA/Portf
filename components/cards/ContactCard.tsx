"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { contactCTA, socialLinks } from "@/lib/placeholder-content";
import { cardVariants } from "@/lib/animations";
import CalendarBooking from "@/components/CalendarBooking";

export default function ContactCard() {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleContact = () => {
    window.location.href = "mailto:ian@plyaz.com";
  };

  return (
    <motion.div
      className="glass rounded-3xl p-10 max-w-5xl relative overflow-hidden"
      variants={cardVariants}
      id="contact"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neonPink/20 to-electricPurple/20 rounded-full blur-3xl -z-10" />

      <AnimatePresence mode="wait">
        {!showCalendar ? (
          <motion.div
            key="contact-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8">
              <motion.p
                className="text-sm text-gray-400 mb-2 uppercase tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Let's Get Connected
              </motion.p>

              <motion.h2
                className="text-4xl md:text-5xl font-black text-white leading-tight font-[family-name:var(--font-outfit)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {contactCTA.question}
              </motion.h2>

              <motion.p
                className="text-gray-300 mt-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {contactCTA.subtitle}
              </motion.p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Book a Chat Button */}
              <motion.button
                className="group relative bg-gradient-to-r from-neonPink via-electricPurple to-skyBlue text-white px-8 py-5 rounded-full flex items-center gap-4 w-full hover:shadow-glow-pink transition-all duration-300"
                onClick={() => setShowCalendar(true)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Calendar icon */}
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Button text */}
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">Schedule a Coffee Chat</div>
                  <div className="text-sm opacity-90">Pick a time that works for you</div>
                </div>

                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Quick Email Button */}
              <motion.button
                className="group relative bg-white text-black px-8 py-5 rounded-full flex items-center gap-4 w-full hover:shadow-dramatic transition-shadow duration-300"
                onClick={handleContact}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Email icon */}
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-neonPink transition-colors duration-300">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Button text */}
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">Send a Quick Email</div>
                  <div className="text-sm text-gray-600">ian@plyaz.com</div>
                </div>

                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Social links */}
            <motion.div
              className="mt-8 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-gray-400 mb-4">Or find me on</p>
              <div className="flex gap-4 flex-wrap">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    className="px-4 py-2 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-all text-sm font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.name}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-8 grid grid-cols-3 gap-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div>
                <div className="text-2xl font-black text-neonPink">24h</div>
                <div className="text-xs text-gray-500 uppercase">Response Time</div>
              </div>
              <div>
                <div className="text-2xl font-black text-electricPurple">100%</div>
                <div className="text-xs text-gray-500 uppercase">Reply Rate</div>
              </div>
              <div>
                <div className="text-2xl font-black text-skyBlue">Open</div>
                <div className="text-xs text-gray-500 uppercase">To Opportunities</div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="calendar-booking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back button */}
            <motion.button
              onClick={() => setShowCalendar(false)}
              className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ x: -5 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to options</span>
            </motion.button>

            {/* Calendar Booking Component */}
            <CalendarBooking />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
