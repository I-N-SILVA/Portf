"use client";

import Link from "next/link";
import { LocaleProvider } from "@/lib/i18n";
import ShaftRequestBuilder from "@/components/shaft/ShaftRequestBuilder";

export default function BriefPage() {
  return (
    <LocaleProvider>
      <main
        id="main"
        className="shaft-type min-h-screen px-6 py-16 md:px-16 md:py-24 lg:px-24"
        style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
      >
        <Link
          href="/"
          className="font-space-mono text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          style={{ color: "rgb(var(--shaft-muted))" }}
        >
          ← Ian N. Silva
        </Link>
        <div className="mt-14">
          <ShaftRequestBuilder />
        </div>
      </main>
    </LocaleProvider>
  );
}
