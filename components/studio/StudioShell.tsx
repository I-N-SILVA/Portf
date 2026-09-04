import { CLIENT_SITE } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import StudioNav from "@/components/studio/StudioNav";

/**
 * The parchment-and-serif chrome shared by every public client-facing page:
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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-stone-900 selection:text-stone-50 [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-stone-900 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-stone-900 [&_summary:focus-visible]:outline [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-offset-2 [&_summary:focus-visible]:outline-stone-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-sm focus:text-stone-50"
      >
        Skip to content
      </a>
      {showNav && <StudioNav />}
      <div id="main-content">{children}</div>
      <footer className="border-t border-stone-800 bg-stone-900 px-6 pb-24 pt-8 md:pb-8">
        <div // stone-500 on this footer's stone-900 is 3.65:1, under the 4.5:1 AA
          // needs. stone-400 clears it at 6.93:1 and still reads as secondary.
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-stone-400 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {CLIENT_SITE.NAME}
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
      </footer>
    </div>
  );
}
