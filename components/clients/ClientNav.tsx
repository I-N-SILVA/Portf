import Link from "next/link";
import ClientNavLinks from "@/components/clients/ClientNavLinks";

export default function ClientNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-50/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/clients" className="flex items-baseline gap-2">
          <span className="font-playfair text-lg font-bold tracking-tight text-stone-900">
            Ian N. Silva
          </span>
          <span className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
            Studio
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <ClientNavLinks />
          <Link
            href="/clients#contact"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition-colors hover:bg-stone-700"
          >
            Start a project
          </Link>
        </div>
      </nav>
    </header>
  );
}
