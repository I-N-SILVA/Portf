"use client";

import { motion } from "framer-motion";
import { contactCTA, socialLinks } from "@/lib/placeholder-content";

export default function Contact() {
  const handleContact = () => {
    window.location.href = "mailto:iannogueira@proton.me";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Contact</h2>
      <div className="space-y-4">
        <motion.button
          className="group relative bg-muted text-foreground border border-border px-8 py-5 rounded-full flex items-center gap-4 w-full hover:shadow-lg hover:border-primary/50 transition-all duration-300"
          onClick={handleContact}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <svg
              className="w-5 h-5"
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
          <div className="flex-1 text-left">
            <div className="font-bold text-lg">Send a Quick Email</div>
            <div className="text-sm text-muted-foreground">iannogueira@proton.me</div>
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
      <motion.div
        className="mt-8 pt-8 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-muted-foreground mb-4">Or find me on</p>
        <div className="flex gap-4 flex-wrap">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all text-sm font-medium border border-transparent hover:border-primary/20"
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
    </div>
  );
}
