import { ImageResponse } from "next/og";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/components/og/OgCard";
import { SITE } from "@/lib/constants";

export const alt = SITE.TITLE;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Portfolio"
        title="AI Automation Engineer & Full-Stack Developer"
        subtitle="AI agents, automation workflows, Web3, and the products around them."
      />
    ),
    size,
  );
}
