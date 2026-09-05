import { CLIENT_SITE } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import { BrandMotionProvider, MotionToggle } from "@/components/brand/BrandMotion";
import BrandMark from "@/components/brand/BrandMark";
import Link from "next/link";
import StudioNav from "@/components/studio/StudioNav";

/**
 * The paper-and-ink chrome shared by every public client-facing page:
 * the studio at /studio and the published pitch page at /c/{slug}.
 *
 * Signed-in clients get the Shaft OS chrome instead (components/os/OSChrome)
 * — same origin, deliberately different room.
 */
export default function StudioShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <BrandMotionProvider><div className="studio-brand min-h-screen bg-[var(--brand-paper)] font-sans text-[var(--brand-ink)] antialiased selection:bg-[var(--brand-ink)] selection:text-stone-50 [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_summary:focus-visible]:outline [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-offset-2">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[var(--brand-ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-stone-50"
      >
        Skip to content
      </a>
      {showNav && <StudioNav />}
      <div id="main" tabIndex={-1}><div id="main-content">{children}</div></div>
      <footer className="border-t border-stone-800 bg-[var(--brand-ink)] px-6 pb-24 pt-8 md:pb-8">
        <div // stone-500 on this footer's stone-900 is 3.65:1, under the 4.5:1 AA
          // needs. stone-400 clears it at 6.93:1 and still reads as secondary.
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-stone-400 sm:flex-row">
          <span>
            <span className="inline-flex items-center gap-3"><BrandMark size={36} />© {new Date().getFullYear()} {CLIENT_SITE.NAME}</span>
          </span>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="transition-colors hover:text-stone-300"
          >
            {CLIENT_SITE.EMAIL}
          </a>
          <a
            href={routes.home}
            className="transition-colors hover:text-stone-300"
          >
            Looking for the interactive portfolio? →
          </a>
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5"><Link href="/studio/brand" className="text-xs text-[var(--brand-paper)] underline underline-offset-4">Brand & motion library ↗</Link><MotionToggle /></div>
      </footer>
    </div></BrandMotionProvider>
  );
}
