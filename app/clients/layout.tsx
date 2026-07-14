import type { Metadata } from "next";
import { CLIENT_SITE } from "@/lib/client-content";
import ClientNav from "@/components/clients/ClientNav";

export const metadata: Metadata = {
  title: {
    default: CLIENT_SITE.TITLE,
    template: `%s — ${CLIENT_SITE.NAME}`,
  },
  description: CLIENT_SITE.DESCRIPTION,
  openGraph: {
    title: CLIENT_SITE.TITLE,
    description: CLIENT_SITE.DESCRIPTION,
    siteName: CLIENT_SITE.NAME,
    type: "website",
  },
};

export default function ClientStudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-stone-900 selection:text-stone-50">
      <ClientNav />
      {children}
      <footer className="border-t border-stone-800 bg-stone-900 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-stone-500 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {CLIENT_SITE.NAME}
          </span>
          {/* Absolute URL: on the subdomain, "/" would rewrite back into this view */}
          <a
            href={CLIENT_SITE.MAIN_SITE_URL}
            className="transition-colors hover:text-stone-300"
          >
            Looking for the interactive portfolio? →
          </a>
        </div>
      </footer>
    </div>
  );
}
