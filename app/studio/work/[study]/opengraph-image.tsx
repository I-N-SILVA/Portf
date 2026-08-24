import { caseStudies, getCaseStudy } from "@/lib/client-content";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Case study";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ study: cs.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ study: string }>;
}) {
  const { study } = await params;
  const cs = getCaseStudy(study);

  return ogCard({
    eyebrow: cs ? cs.industry : "Case study",
    title: cs ? cs.headline : "Case study",
    subtitle: cs ? cs.services.join(" · ") : undefined,
  });
}
