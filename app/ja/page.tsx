import type { Metadata } from "next";
import ShaftLandingContent from "@/components/shaft/ShaftLandingContent";
import { localeAlternates } from "@/lib/locale-routes";

/** The portfolio in Japanese. Same page as `/`, resolved server-side. */
export const metadata: Metadata = {
  alternates: localeAlternates("ja"),
};

export default function LandingPageJA() {
  return <ShaftLandingContent locale="ja" />;
}
