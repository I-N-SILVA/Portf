import type { Metadata } from "next";
import { CLIENT_SITE } from "@/lib/client-content";
import StudioShell from "@/components/studio/StudioShell";

/**
 * Wraps what is left under /studio: the case-study records at
 * /studio/work/{slug}. The landing this layout was written for is gone, so
 * the metadata no longer announces a studio homepage — no canonical or
 * og:url pointing at /studio (that URL 404s now), and no ProfessionalService
 * JSON-LD, which described a service page rather than these records. Each
 * record supplies its own title and description through generateMetadata.
 */
export const metadata: Metadata = {
  title: { template: `%s — ${CLIENT_SITE.NAME}`, default: CLIENT_SITE.NAME },
};

export default function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StudioShell>{children}</StudioShell>;
}
