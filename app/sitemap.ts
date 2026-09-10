import { MetadataRoute } from "next";
import { caseStudies } from "@/lib/client-content";
import { ROUTED_LOCALES, localePath } from "@/lib/locales";
import { routes, siteUrl } from "@/lib/routes";

/**
 * The indexable surface.
 *
 * Client spaces (/c/*), the portal and the admin console are absent on
 * purpose — they are noindexed and Disallowed in app/robots.ts.
 *
 * This used to list four in-page anchors: /#about, /#projects, /#expertise
 * and /#contact. Not one of them existed — the sections are #shaft-hero,
 * #shaft-archive, #shaft-offers and #shaft-call — so all four were dead
 * links. They are gone rather than corrected, because a fragment is not a
 * separate URL to a crawler and listing one has never affected indexing.
 *
 * What replaces them is the thing that was genuinely missing: the
 * case-study records. They are full, indexable pages about real work, they
 * carry the most detail of anything on the site, and nothing pointed a
 * crawler at them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  /** Every locale of the landing page, as hreflang alternates. */
  const languages = Object.fromEntries([
    ["en", siteUrl("/")],
    ...ROUTED_LOCALES.map((code) => [code, siteUrl(localePath(code))]),
    // Tells Google which version to serve where it has no better match.
    ["x-default", siteUrl("/")],
  ]);

  return [
    {
      url: siteUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    ...ROUTED_LOCALES.map((code) => ({
      url: siteUrl(localePath(code)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: { languages },
    })),
    ...caseStudies.map((study) => ({
      url: siteUrl(routes.studio.work(study.slug)),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
