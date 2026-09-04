import { ImageResponse } from "next/og";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/components/og/OgCard";

export const alt = "Ian N. Silva — Independent AI Consultant";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Independent AI consultant"
        title="AI that earns its place in your workflow"
        subtitle="From opportunity mapping to working systems your team can use and own."
      />
    ),
    size,
  );
}
