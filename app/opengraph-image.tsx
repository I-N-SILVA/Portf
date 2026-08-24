import { SITE } from "@/lib/constants";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = `${SITE.NAME} — AI Consultant & Behavioral Economist`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Portfolio",
    title: "Ian N. Silva",
    subtitle:
      "AI Consultant · Behavioral Economist. Turning vague ideas into automations, landing pages and MVPs you can test in weeks.",
  });
}
