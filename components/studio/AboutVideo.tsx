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
    <div className="st-night relative aspect-video overflow-hidden"
      style={{ border: "1px solid var(--st-border)" }}>
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
          className="st-grid group absolute inset-0 flex flex-col items-center justify-center gap-4"
        >
          <span
            className="flex h-14 w-14 items-center justify-center transition-colors group-hover:bg-[var(--st-night-ink)] group-hover:text-[var(--st-night)]"
            style={{ border: "1px solid var(--st-night-ink)" }}
          >
            <Play className="ml-0.5 h-5 w-5" />
          </span>
          <span className="st-label">{label}</span>
        </button>
      )}
    </div>
  );
}
