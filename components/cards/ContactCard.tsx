"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { socialLinks } from "@/lib/placeholder-content";
import { cardVariants } from "@/lib/animations";
import { Terminal as TerminalIcon, AlertCircle, type LucideIcon } from "lucide-react";
import { PLACEHOLDER_SOCIAL_URLS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMousePosition } from "@/components/context/MouseContext";

const LiquidMesh = ({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) => {
  const meshX = useTransform(x, [0, 2000], [20, -20]);
  const meshY = useTransform(y, [0, 1200], [20, -20]);

  return (
    <motion.div
      className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none"
      style={{ x: meshX, y: meshY }}
    >
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-sky-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-sky-secondary/15 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
    </motion.div>
  );
};

interface MagneticOrbProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

const MagneticOrb = ({ icon: Icon, label, onClick, mouseX, mouseY }: MagneticOrbProps) => {
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
    const unsubX = mouseX.on("change", handleMouse);
    const unsubY = mouseY.on("change", handleMouse);
    return () => { unsubX(); unsubY(); };
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
      <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-primary/80">{label}</span>
      </div>
      <div className="absolute inset-0 rounded-full bg-sky-primary/0 group-hover:bg-sky-primary/10 blur-xl transition-all duration-500" />
    </motion.button>
  );
};

/** Strip HTML-special characters from terminal input to prevent injection. */
function sanitizeInput(raw: string): string {
  return raw.replace(/[<>&"'`]/g, "");
}

export default function ContactCard() {
  const { springX, springY } = useMousePosition();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<
    { id: string; type: "input" | "output" | "system"; text: React.ReactNode }[]
  >([
    { id: "init", type: "system", text: "IAN N. SILVA OS v2.4.9" },
    { id: "init2", type: "system", text: "Type 'help' to see available commands." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = sanitizeInput(cmd.trim().toLowerCase());
    if (!trimmed) return;

    setHistory((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "input", text: `guest@ins-os:~$ ${trimmed}` },
    ]);

    setTimeout(() => {
      let output: React.ReactNode = "";
      if (trimmed === "help") {
        output = (
          <div className="flex flex-col gap-1 text-sky-text-secondary">
            <span>Available commands:</span>
            <span className="text-sky-primary">book   <span className="text-sky-text-secondary/60">- Schedule a consultation session</span></span>
            <span className="text-sky-primary">email  <span className="text-sky-text-secondary/60">- Initialize direct secure memo</span></span>
            <span className="text-sky-primary">links  <span className="text-sky-text-secondary/60">- Display active comm channels</span></span>
            <span className="text-sky-primary">clear  <span className="text-sky-text-secondary/60">- Clear terminal output</span></span>
          </div>
        );
      } else if (trimmed === "book") {
        output = <span className="text-green-400">Opening Calendly handshake protocol...</span>;
        setTimeout(() => window.open("https://calendly.com", "_blank"), 800);
      } else if (trimmed === "email") {
        output = <span className="text-green-400">Initializing mail client...</span>;
        setTimeout(() => { window.location.href = "mailto:iannogueira@proton.me"; }, 800);
      } else if (trimmed === "links") {
        output = (
          <div className="flex flex-col gap-1">
            {socialLinks.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sky-primary hover:underline hover:text-sky-text-primary transition-colors flex items-center gap-1">
                [LINK] {s.name}
                {PLACEHOLDER_SOCIAL_URLS.includes(s.url as any) && (
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                )}
              </a>
            ))}
          </div>
        );
      } else if (trimmed === "clear") {
        setHistory([{ id: crypto.randomUUID(), type: "system", text: "IAN N. SILVA OS v2.4.9" }]);
        return;
      } else {
        output = <span className="text-red-400">Command not found: {trimmed}</span>;
      }
      setHistory((prev) => [...prev, { id: crypto.randomUUID(), type: "output", text: output }]);
    }, 150);
  };

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
          className="text-6xl md:text-8xl font-black uppercase tracking-[0.2em] font-outfit text-sky-text-primary mb-4"
        >
          LET&apos;S <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">CONNECT</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[12px] font-mono font-bold uppercase tracking-widest text-sky-text-secondary/40"
        >
          {"// Secure stream established — enter command to proceed"}
        </motion.p>
      </div>

      {/* Interactive Terminal */}
      <div
        role="region"
        aria-label="Interactive terminal"
        className="relative z-20 w-full max-w-2xl bg-black/40 backdrop-blur-md border border-sky-border/30 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[300px]"
      >
        {/* Terminal Header */}
        <div className="h-8 bg-black/60 border-b border-sky-border/20 flex items-center px-4 justify-between select-none">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-sky-primary/70" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold text-sky-text-secondary">guest@ins-os</span>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="size-2 rounded-full bg-red-500/50" />
            <div className="size-2 rounded-full bg-yellow-500/50" />
            <div className="size-2 rounded-full bg-green-500/50" />
          </div>
        </div>

        {/* Terminal Output */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 font-mono text-xs text-sky-text-secondary scrollbar-thin scrollbar-thumb-sky-primary/20"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "break-words",
                entry.type === "system" && "text-sky-primary font-bold mb-2",
                entry.type === "input" && "text-sky-text-primary"
              )}
            >
              {entry.text}
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <div className="bg-black/60 border-t border-sky-border/20 p-2 px-4 flex flex-col gap-2">
          {input === "" && history.length <= 2 && ( // Only show hint if input is empty and no commands typed yet
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="font-mono text-xs text-sky-text-secondary/50 text-center"
            >
              Available commands: <span className="text-sky-primary">book</span>, <span className="text-sky-primary">email</span>, <span className="text-sky-primary">links</span>, <span className="text-sky-primary">clear</span>
            </motion.p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sky-primary font-mono text-sm font-bold" aria-hidden="true">guest@ins-os:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCommand(input);
                  setInput("");
                }
              }}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal command input"
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-sky-text-primary caret-sky-primary placeholder:text-sky-text-secondary/70 focus:ring-0"
              placeholder="Type a command..."
            />
          </div>
        </div>
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
                rel="noopener noreferrer"
                className="text-[9px] font-black font-mono text-sky-text-secondary/40 hover:text-sky-primary transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-2">
            <div className="size-1 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" aria-hidden="true" />
            <span className="text-[9px] font-mono font-bold text-sky-text-secondary/60">LIVE_HANDSHAKE_OK</span>
          </div>
          <span className="text-[8px] font-mono text-sky-text-secondary/20">EST: 2026.02.26.STREAM</span>
        </div>
      </motion.div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl m-4" aria-hidden="true" />
    </motion.div>
  );
}
