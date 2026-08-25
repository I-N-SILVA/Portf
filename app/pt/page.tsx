import type { Metadata } from "next";
import ShaftLandingContent from "@/components/shaft/ShaftLandingContent";
import { localeAlternates } from "@/lib/locale-routes";

/** The portfolio in Portuguese. Same page as `/`, resolved server-side. */
export const metadata: Metadata = {
  alternates: localeAlternates("pt"),
};

export default function LandingPagePT() {
  return <ShaftLandingContent locale="pt" />;
}
