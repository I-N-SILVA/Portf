"use client";

import { useState } from "react";
import { Play } from "lucide-react";

// Turns a Loom or YouTube share URL into its embeddable form.
function toEmbedUrl(url: string): string {
  const loom = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;

  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  return url;
}

interface AboutVideoProps {
  url: string;
  label: string;
}

// Click-to-load facade so the heavy video iframe only mounts on intent.
export default function AboutVideo({ url, label }: AboutVideoProps) {
  const [playing, setPlaying] = useState(false);
  const embed = toEmbedUrl(url);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-stone-900">
      {playing ? (
        <iframe
          src={`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`}
          title="Intro video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-stone-800 to-stone-900"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-paper-raised)] text-[var(--brand-ink)] shadow-lg transition-transform group-hover:scale-105">
            <Play className="ml-1 h-6 w-6" />
          </span>
          <span className="text-sm font-medium text-stone-100">{label}</span>
        </button>
      )}
    </div>
  );
}
