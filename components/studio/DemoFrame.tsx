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
    <div className="overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-paper-raised)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-paper-shade)] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        </div>
        <span className="hidden truncate rounded-md bg-[var(--brand-paper-raised)] px-3 py-1 font-space-mono text-[11px] text-[var(--brand-muted)] sm:block">
          {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
        >
          Open in new tab <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {mounted ? (
        <div className="relative">
          {!ready && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--brand-paper)]">
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
              <span className="text-xs text-[var(--brand-muted)]">
                Loading the live app…
              </span>
            </div>
          )}
          <iframe
            src={url}
            title={`Live demo — ${title}`}
            onLoad={() => setReady(true)}
            className="h-[420px] w-full bg-[var(--brand-paper-raised)] md:h-[560px]"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      ) : (
        <button
          onClick={() => setMounted(true)}
          className="group flex h-[320px] w-full flex-col items-center justify-center gap-3 bg-[var(--brand-paper)] transition-colors hover:bg-[var(--brand-paper-shade)] md:h-[420px]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-stone-50 transition-transform group-hover:scale-105">
            <Play className="ml-0.5 h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-[var(--brand-ink)]">
            Try the live product
          </span>
          <span className="text-xs text-[var(--brand-muted)]">
            Loads the real deployed app right here
          </span>
        </button>
      )}
    </div>
  );
}
