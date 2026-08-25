import type { Metadata } from "next";
import ShaftLandingContent from "@/components/shaft/ShaftLandingContent";
import { localeAlternates } from "@/lib/locale-routes";

/**
 * English lives at the root; /pt, /es, /ja and /zh are the same page in the
 * other four languages. The alternates have to be listed on every version,
 * this one included, or search engines discard the set.
 */
export const metadata: Metadata = {
  alternates: localeAlternates("en"),
};

export default function LandingPage() {
  return <ShaftLandingContent />;
}
