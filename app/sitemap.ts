import { MetadataRoute } from "next";
import { caseStudies } from "@/lib/client-content";
import { routes, siteUrl } from "@/lib/routes";

/**
 * Public surface only: the portfolio and the studio. Client spaces (/c/*),
 * the portal and the admin console are intentionally absent — they're
 * noindexed and Disallowed in robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: siteUrl("/#about"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/#projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/#expertise"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/#contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    {
      url: siteUrl(routes.studio.root),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...caseStudies.map((cs) => ({
      url: siteUrl(routes.studio.work(cs.slug)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
