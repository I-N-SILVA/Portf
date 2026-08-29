import Link from "next/link";
import StudioNavLinks from "@/components/studio/StudioNavLinks";
import { routes } from "@/lib/routes";

/**
 * A single ruled line across the top of the document, not a floating
 * capsule. It stays put rather than following the scroll: the page is short
 * enough that a persistent bar would cost more than it returns, and the
 * contact block ends the page anyway.
 */
export default function StudioNav() {
  return (
    <header
      className="st-night relative z-50"
      style={{ borderBottom: "1px solid var(--st-night-border)" }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Link
          href={routes.studio.root}
          className="flex items-baseline gap-3 whitespace-nowrap"
        >
          <span
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: "var(--st-serif)" }}
          >
            Ian N. Silva
          </span>
          <span className="st-label">Studio</span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <StudioNavLinks />
          <Link
            href={routes.studio.section("contact")}
            className="st-label border px-4 py-2.5 transition-colors hover:bg-[var(--st-night-ink)] hover:text-[var(--st-night)]"
            style={{ borderColor: "var(--st-night-border)" }}
          >
            Start
          </Link>
        </div>
      </nav>
    </header>
  );
}
