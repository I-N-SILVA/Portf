import "@/components/studio/studio-theme.css";
import { CLIENT_SITE } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import StudioNav from "@/components/studio/StudioNav";

/**
 * The chrome shared by every public client-facing page: the studio at
 * /studio and the published pitch page at /c/{slug}.
 *
 * Signed-in clients get the Shaft OS chrome instead (components/os/OSChrome)
 * — same origin, same paper, one room further in.
 */
export default function StudioShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="studio-doc min-h-screen antialiased [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[var(--st-accent)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--st-accent)] [&_summary:focus-visible]:outline [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-offset-2 [&_summary:focus-visible]:outline-[var(--st-accent)]">
      <div className="st-paper" aria-hidden="true" />
      <a
        href="#main-content"
        className="st-label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-[var(--st-ink)] focus:px-4 focus:py-3 focus:text-[var(--st-bg)]"
      >
        Skip to content
      </a>
      {showNav && <StudioNav />}
      <div id="main-content">{children}</div>

      <footer
        className="st-night st-grid px-6 py-10 md:px-10"
        style={{ borderTop: "1px solid var(--st-night-border)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="st-meta">
            © {new Date().getFullYear()} {CLIENT_SITE.NAME}
          </span>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="st-meta st-underline st-underline-grow"
          >
            {CLIENT_SITE.EMAIL}
          </a>
          <a href={routes.home} className="st-meta st-underline st-underline-grow">
            Interactive portfolio →
          </a>
        </div>
      </footer>
    </div>
  );
}
