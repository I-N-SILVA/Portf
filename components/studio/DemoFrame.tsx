"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Play } from "lucide-react";

interface DemoFrameProps {
  url: string;
  title: string;
}

// Embeds the real deployed app behind a click-to-load frame so the case
// study page stays fast and the iframe only mounts on intent.
export default function DemoFrame({ url, title }: DemoFrameProps) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <div className="overflow-hidden"
      style={{
        border: "1px solid var(--st-border)",
        backgroundColor: "var(--st-surface)",
      }}>
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{
          borderBottom: "1px solid var(--st-border)",
          backgroundColor: "var(--st-surface-alt)",
        }}>
        <div className="flex items-center gap-1.5">
          {/* Three ruled ticks rather than traffic lights — this is a document,
              and the chrome should not pretend to be a different OS. */}
          <span className="h-px w-2.5" style={{ backgroundColor: "var(--st-border)" }} />
          <span className="h-px w-2.5" style={{ backgroundColor: "var(--st-border)" }} />
          <span className="h-px w-2.5" style={{ backgroundColor: "var(--st-border)" }} />
        </div>
        <span className="st-note hidden truncate sm:block">
          {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="st-label st-underline st-underline-grow flex items-center gap-1.5"
        >
          Open in new tab <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {mounted ? (
        <div className="relative">
          {!ready && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ backgroundColor: "var(--st-surface-alt)" }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--st-accent)" }} />
              <span className="st-label">Loading the live app…</span>
            </div>
          )}
          <iframe
            src={url}
            title={`Live demo — ${title}`}
            onLoad={() => setReady(true)}
            className="h-[420px] w-full bg-white md:h-[560px]"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      ) : (
        <button
          onClick={() => setMounted(true)}
          className="group flex h-[320px] w-full flex-col items-center justify-center gap-4 transition-colors hover:bg-[var(--st-surface-alt)] md:h-[420px]"
        >
          <span className="flex h-14 w-14 items-center justify-center transition-colors group-hover:bg-[var(--st-accent)] group-hover:text-[var(--st-surface)]"
            style={{ border: "1px solid var(--st-ink)" }}>
            <Play className="ml-0.5 h-5 w-5" />
          </span>
          <span className="st-label">Try the live product</span>
          <span className="st-note">Loads the real deployed app right here</span>
        </button>
      )}
    </div>
  );
}
