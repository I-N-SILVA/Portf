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
    images: [
      {
        url: "/brand-full.png",
        width: 1024,
        height: 1024,
        alt: CLIENT_SITE.NAME,
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: CLIENT_SITE.NAME,
  description: CLIENT_SITE.DESCRIPTION,
  url: `${CLIENT_SITE.MAIN_SITE_URL}/clients`,
  email: CLIENT_SITE.EMAIL,
  founder: { "@type": "Person", name: "Ian N. Silva" },
  areaServed: "Worldwide",
  serviceType: [
    "AI Automation",
    "Internal Tools & Dashboards",
    "MVP & Product Development",
  ],
};

export default function ClientStudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-stone-900 selection:text-stone-50 [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-stone-900 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-stone-900 [&_summary:focus-visible]:outline [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-offset-2 [&_summary:focus-visible]:outline-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-sm focus:text-stone-50"
      >
        Skip to content
      </a>
      <ClientNav />
      <div id="main-content">{children}</div>
      <footer className="border-t border-stone-800 bg-stone-900 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-stone-500 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {CLIENT_SITE.NAME}
          </span>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="transition-colors hover:text-stone-300"
          >
            {CLIENT_SITE.EMAIL}
          </a>
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
