import { ImageResponse } from "next/og";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/components/og/OgCard";

export const alt = "Ian N. Silva — AI Automation & Product Studio";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Studio"
        title="Automation that pays for itself"
        subtitle="Services, case studies, and how the work actually runs."
      />
    ),
    size,
  );
}
