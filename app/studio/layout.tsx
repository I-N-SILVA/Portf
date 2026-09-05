import type { Metadata } from "next";
import { CLIENT_SITE } from "@/lib/client-content";
import { routes, siteUrl } from "@/lib/routes";
import StudioShell from "@/components/studio/StudioShell";

export const metadata: Metadata = {
  title: {
    default: CLIENT_SITE.TITLE,
    template: `%s — ${CLIENT_SITE.NAME}`,
  },
  description: CLIENT_SITE.DESCRIPTION,
  alternates: { canonical: siteUrl(routes.studio.root) },
  openGraph: {
    title: CLIENT_SITE.TITLE,
    description: CLIENT_SITE.DESCRIPTION,
    siteName: CLIENT_SITE.NAME,
    type: "website",
    url: siteUrl(routes.studio.root),
    // app/studio/opengraph-image.tsx generates the card; a file-convention
    // image takes precedence over this field regardless.
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: CLIENT_SITE.NAME,
  description: CLIENT_SITE.DESCRIPTION,
  url: siteUrl(routes.studio.root),
  email: CLIENT_SITE.EMAIL,
  founder: { "@type": "Person", name: "Ian N. Silva" },
  areaServed: "Worldwide",
  serviceType: [
    "AI workflow consulting",
    "Automation and agent systems",
    "AI implementation and handover",
  ],
};

export default function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StudioShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </StudioShell>
  );
}
