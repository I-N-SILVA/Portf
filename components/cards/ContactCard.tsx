"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { contactCTA, socialLinks } from "@/lib/placeholder-content";
import { cardVariants } from "@/lib/animations";
import CalendarBooking from "@/components/CalendarBooking";
import { Calendar, Mail, ArrowRight, MessageSquare, Globe, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactCard() {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleEmail = () => {
    window.location.href = "mailto:iannogueira@proton.me";
  };

  const actions = [
    {
      id: "calendar",
      title: "Book a Coffee Chat",
      description: "Pick a 30m slot on my calendar",
      icon: Calendar,
      color: "bg-sky-primary",
      onClick: () => setShowCalendar(true)
    },
    {
      id: "email",
      title: "Send a Quick Memo",
      description: "iannogueira@proton.me",
      icon: Mail,
      color: "bg-sky-secondary",
      onClick: handleEmail
    }
  ];

  return (
    <motion.div
      className="bg-card/40 backdrop-blur-sm shadow-sky-glow rounded-card border border-sky-border/10 max-w-5xl relative overflow-hidden h-full"
      variants={cardVariants}
    >
      <AnimatePresence mode="wait">
        {!showCalendar ? (
          <motion.div
            key="contact-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-sky-border/10 h-full"
          >
            {/* Left Panel: Bold Typography */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-20 -left-20 size-80 bg-sky-primary/10 blur-[100px] group-hover:bg-sky-primary/20 transition-colors duration-700" />

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 mb-6"
                >
                  <div className="size-2 rounded-full bg-sky-primary animate-pulse shadow-sky-glow" />
                  <span className="text-[10px] font-mono font-black tracking-[0.3em] uppercase text-sky-primary/60">Let&apos;s Connect</span>
                </motion.div>

                <motion.h2
                  className="text-7xl md:text-8xl font-black leading-[0.8] tracking-tighter uppercase font-[family-name:var(--font-outfit)] text-sky-text-primary mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Let&apos;s <br />
                  <span className="text-transparent border-t-4 border-sky-primary pt-2 bg-clip-text bg-gradient-to-r from-sky-primary to-sky-secondary">Connect.</span>
                </motion.h2>

                <motion.p
                  className="text-lg text-sky-text-secondary/80 max-w-xs leading-relaxed font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to turn ideas into reality? Level up with a 1:1 strategy session.
                </motion.p>
              </div>

              {/* Stats Badges */}
              <motion.div
                className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-sky-border/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {[
                  { label: "Response", value: "~2h", color: "text-sky-primary" },
                  { label: "Rate", value: "100%", color: "text-sky-secondary" },
                  { label: "Status", value: "ONLINE", color: "text-green-400" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className={cn("text-xl font-black font-mono", stat.color)}>{stat.value}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-sky-text-secondary/40">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Panel: Interactive Terminal */}
            <div className="lg:w-1/2 p-4 lg:p-6 bg-sky-primary/[0.02] flex flex-col h-full min-h-[400px]">
              <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-xl border border-sky-border/10 overflow-hidden flex flex-col shadow-2xl">
                {/* Terminal Header */}
                <div className="bg-sky-border/10 px-4 py-2 flex items-center justify-between border-b border-sky-border/5">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-red-500/50" />
                    <div className="size-2.5 rounded-full bg-orange-500/50" />
                    <div className="size-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[10px] font-mono text-sky-text-secondary/40 font-bold uppercase tracking-wider">ian_silva@terminal ~ v1.0.4</span>
                </div>

                {/* Terminal Content */}
                <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-sky-primary/20">
                  <div className="space-y-1">
                    <p className="text-sky-primary/60 font-bold">// SECURE ESTABLISHMENT COMPLETED</p>
                    <p className="text-sky-text-secondary/80 leading-relaxed">
                      Welcome to the direct stream. How would you like to proceed?
                    </p>
                  </div>

                  <div className="grid gap-3 mt-6">
                    {[
                      {
                        cmd: "book.session",
                        desc: "Schedule a high-impact strategy call",
                        icon: Calendar,
                        action: () => window.open("https://calendly.com", "_blank")
                      },
                      {
                        cmd: "send.memo",
                        desc: "Direct encrypted email transmission",
                        icon: Mail,
                        action: () => window.location.href = "mailto:iannogueira@proton.me"
                      },
                      {
                        cmd: "view.links",
                        desc: "Access social channels and streams",
                        icon: Globe,
                        action: () => { }
                      }
                    ].map((item, i) => (
                      <motion.button
                        key={item.cmd}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        onClick={item.action}
                        className="group flex flex-col p-4 rounded-lg bg-sky-primary/5 border border-sky-border/5 hover:border-sky-primary/30 hover:bg-sky-primary/10 transition-all text-left relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sky-primary font-black flex items-center gap-2">
                            <item.icon size={12} />
                            {item.cmd}
                          </span>
                          <span className="text-[9px] text-sky-text-secondary/20 group-hover:text-sky-text-secondary/40 transition-colors uppercase font-black">Ready_to_exec</span>
                        </div>
                        <p className="text-[11px] text-sky-text-secondary/60 font-medium">{item.desc}</p>

                        {/* Hover bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-primary/0 group-hover:bg-sky-primary transition-all duration-300" />
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-2">
                    <span className="text-sky-primary font-black animate-pulse">{'>'}</span>
                    <span className="w-2 h-4 bg-sky-primary/40 animate-[blink_1s_infinite]" />
                    <style jsx>{`
                      @keyframes blink {
                        50% { opacity: 0; }
                      }
                    `}</style>
                  </div>
                </div>

                {/* Terminal Footer */}
                <div className="px-6 py-4 bg-sky-primary/[0.02] border-t border-sky-border/5 flex items-center justify-between">
                  <div className="flex gap-4">
                    {socialLinks.slice(0, 3).map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        className="text-[9px] font-black font-mono text-sky-text-secondary/30 hover:text-sky-primary transition-colors uppercase tracking-widest"
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 opacity-20">
                    <div className="size-1 bg-sky-primary rounded-full animate-ping" />
                    <span className="text-[8px] font-mono font-bold tracking-tighter">X-RAY_SCAN_OK</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div /> // Fallback for unused showCalendar state
        )}
      </AnimatePresence>
    </motion.div>
  );
}

