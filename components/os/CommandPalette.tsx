"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type Command = { label: string; href?: string; hint?: string };

export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      const id = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const results = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  const run = (c: Command) => {
    if (c.href) router.push(c.href);
    onClose();
  };

  return (
    <div className="os-palette" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="os-pal-box">
        <input
          ref={inputRef}
          className="os-pal-input"
          placeholder="type a command…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) run(results[0]);
          }}
        />
        <div className="os-pal-list">
          {results.length === 0 && <div className="os-pal-empty">no matches</div>}
          {results.map((c) => (
            <button key={c.label} className="os-pal-item" onClick={() => run(c)}>
              <span>{c.label}</span>
              {c.hint && <span className="k">{c.hint}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
