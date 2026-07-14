import { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { caseStudies } from "@/lib/client-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.URL;
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/#about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/#projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/#expertise`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/clients`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...caseStudies.map((cs) => ({
      url: `${base}/clients/work/${cs.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
