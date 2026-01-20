"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { socialLinks } from "@/lib/placeholder-content";

type Message = {
  type: "system" | "user" | "response";
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  { type: "system", text: "Initializing Mission Control..." },
  { type: "system", text: "Connected to Silva_OS v1.0.4" },
  { type: "response", text: "Ian is currently online. How can I assist you today?" },
];

const COMMANDS: Record<string, string> = {
  help: "Available commands: status, focus, contact, social, clear",
  status: "System Monitor: Operational. AI Intelligence at 98%. Availability: High.",
  focus: "Current Mission: Building AI Agents & Automations for the next generation of SaaS.",
  social: "Follow the mission on GitHub and LinkedIn. Links are below.",
  contact: "Redirecting to primary communication channel (Email)...",
};

export default function Contact() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.toLowerCase().trim();

    if (cleanCmd === "clear") {
      setMessages([]);
      return;
    }

    if (cleanCmd === "contact") {
      setTimeout(() => {
        window.location.href = "mailto:iannogueira@proton.me";
      }, 1000);
    }

    const response = COMMANDS[cleanCmd] || `Command not found: ${cleanCmd}. Type 'help' for options.`;

    setMessages(prev => [
      ...prev,
      { type: "user", text: cmd },
      { type: "response", text: response }
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    handleCommand(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      <h2 className="text-2xl font-bold text-foreground mb-4">Mission Control</h2>

      {/* Terminal Window */}
      <div
        className="flex-grow bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-sm overflow-hidden flex flex-col shadow-2xl backdrop-blur-md"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Output Area */}
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto mb-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`
              ${msg.type === "system" ? "text-primary/50 text-[10px]" : ""}
              ${msg.type === "user" ? "text-white/40" : ""}
              ${msg.type === "response" ? "text-primary shadow-glow-sm" : ""}
            `}>
              {msg.type === "user" && <span className="mr-2 opacity-30">❯</span>}
              {msg.type === "system" && <span className="mr-2">[*]</span>}
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/5 pt-3">
          <span className="text-primary animate-pulse font-bold">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-transparent border-none outline-none flex-grow text-white placeholder:text-white/10"
            placeholder="Type 'help'..."
            autoFocus
          />
        </form>
      </div>

      {/* Social Links Mini Footer */}
      <div className="mt-6 flex flex-wrap gap-3">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.name}
          </a>
        ))}
      </div>
    </div>
  );
}

