import Link from "next/link";
import StudioNavLinks from "@/components/studio/StudioNavLinks";
import { routes } from "@/lib/routes";

export default function StudioNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-50/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href={routes.home}
            className="flex min-h-10 items-center text-xs font-medium text-stone-500 transition-colors hover:text-stone-900"
            aria-label="Back to the portfolio"
          >
            <span aria-hidden="true">←</span>
            <span className="ml-1 hidden sm:inline">Portfolio</span>
          </Link>
          <span className="h-4 w-px bg-stone-300" aria-hidden="true" />
          <Link href={routes.studio.root} className="flex items-baseline gap-2">
            <span className="font-playfair text-lg font-bold tracking-tight text-stone-900">
              Ian N. Silva
            </span>
            <span className="hidden font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 sm:inline">
              Studio
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <StudioNavLinks />
          <Link
            href={routes.studio.section("contact")}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition-colors hover:bg-stone-700"
          >
            Start a project
          </Link>
        </div>
      </nav>
    </header>
  );
}
