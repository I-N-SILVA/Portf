import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The one full-page state screen behind not-found.tsx and error.tsx.
 *
 * Deliberately plain: no framer-motion, no theme provider, no Supabase. These
 * screens render precisely when something upstream has already failed, so the
 * fewer moving parts they depend on, the more likely they are to be what the
 * visitor actually sees instead of a second error.
 */
export function StatusScreen({
  code,
  title,
  message,
  children,
}: {
  code: string;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
        {code}
      </p>
      <h1 className="max-w-xl text-balance text-3xl font-semibold sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-md text-balance text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {children}
        <Link
          href="/"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back to the portfolio
        </Link>
      </div>
    </main>
  );
}
