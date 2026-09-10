import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/routes";
import { ROUTED_LOCALES, localePath } from "@/lib/locales";

/**
 * Public portfolio surface only. Studio now has its own repository and sitemap. Client spaces (/c/*),
 * the portal and the admin console are intentionally absent — they're
 * noindexed and Disallowed in robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    // The translated landings. Slightly lower priority than the English one,
    // which is the canonical entry point.
    ...ROUTED_LOCALES.map((code) => ({
      url: siteUrl(localePath(code)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: siteUrl("/#about"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/#projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/#expertise"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/#contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
