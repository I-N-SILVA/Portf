"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { socialLinks } from "@/lib/placeholder-content";
import { cardVariants } from "@/lib/animations";
import { Calendar, Mail, Globe, ArrowUpRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMousePosition } from "@/components/context/MouseContext";

const LiquidMesh = ({ x, y }: { x: any, y: any }) => {
  const meshX = useTransform(x, [0, 2000], [20, -20]);
  const meshY = useTransform(y, [0, 1200], [20, -20]);

  return (
    <motion.div
      className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none"
      style={{ x: meshX, y: meshY }}
    >
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-sky-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-sky-secondary/15 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </motion.div>
  );
};

const MagneticOrb = ({
  icon: Icon,
  label,
  onClick,
  mouseX,
  mouseY
}: {
  icon: any,
  label: string,
  onClick: () => void,
  mouseX: any,
  mouseY: any
}) => {
  const orbRef = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    const handleMouse = () => {
      if (!orbRef.current) return;
      const rect = orbRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX.get() - centerX, 2) + Math.pow(mouseY.get() - centerY, 2)
      );

      if (distance < 150) {
        const angle = Math.atan2(mouseY.get() - centerY, mouseX.get() - centerX);
        const attraction = (1 - distance / 150) * 30;
        x.set(Math.cos(angle) * attraction);
        y.set(Math.sin(angle) * attraction);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const unsubscribeX = mouseX.on("change", handleMouse);
    const unsubscribeY = mouseY.on("change", handleMouse);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, x, y]);

  return (
    <motion.button
      ref={orbRef}
      onTap={onClick}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.1 }}
      className="group relative flex items-center justify-center p-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-sky-primary/40 transition-colors duration-500 shadow-standard"
    >
      <Icon className="size-8 text-sky-text-primary group-hover:text-sky-primary transition-colors" strokeWidth={1.5} />

      {/* Label Tooltip */}
      <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-primary/80">{label}</span>
      </div>

      {/* Glow shadow */}
      <div className="absolute inset-0 rounded-full bg-sky-primary/0 group-hover:bg-sky-primary/10 blur-xl transition-all duration-500" />
    </motion.button>
  );
};

export default function ContactCard() {
  const { springX, springY } = useMousePosition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="relative w-full max-w-5xl mx-auto min-h-[600px] flex flex-col items-center justify-center p-12 overflow-hidden"
      variants={cardVariants}
    >
      <LiquidMesh x={springX} y={springY} />

      {/* Typography Layer */}
      <div className="relative z-10 text-center mb-24 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-center justify-center gap-4"
        >
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-sky-primary/40" />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-sky-primary/60">Ready to build</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-sky-primary/40" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-black uppercase tracking-[0.2em] font-[family-name:var(--font-outfit)] text-sky-text-primary mb-4"
        >
          LET&apos;S <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">CONNECT</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[12px] font-mono font-bold uppercase tracking-widest text-sky-text-secondary/40"
        >
          {"// Secure stream established — choose an orb to proceed"}
        </motion.p>
      </div>

      {/* Interactive Orbs */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-12 md:gap-24">
        <MagneticOrb
          icon={Calendar}
          label="Book Session"
          mouseX={springX}
          mouseY={springY}
          onClick={() => window.open("https://calendly.com", "_blank")}
        />
        <MagneticOrb
          icon={Mail}
          label="Direct Memo"
          mouseX={springX}
          mouseY={springY}
          onClick={() => window.location.href = "mailto:iannogueira@proton.me"}
        />
        <MagneticOrb
          icon={MessageSquare}
          label="Direct Access"
          mouseX={springX}
          mouseY={springY}
          onClick={() => { }}
        />
      </div>

      {/* Minimal Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-12 left-0 right-0 px-12 flex justify-between items-end border-t border-white/5 pt-8 pointer-events-none"
      >
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-text-secondary/20">Streams</span>
          <div className="flex gap-4 pointer-events-auto">
            {socialLinks.slice(0, 3).map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                className="text-[9px] font-black font-mono text-sky-text-secondary/40 hover:text-sky-primary transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-2">
            <div className="size-1 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="text-[9px] font-mono font-bold text-sky-text-secondary/60">LIVE_HANDSHAKE_OK</span>
          </div>
          <span className="text-[8px] font-mono text-sky-text-secondary/20">EST: 2026.02.26.STREAM</span>
        </div>
      </motion.div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl m-4" />
    </motion.div>
  );
}

