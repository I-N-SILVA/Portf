import type { Metadata } from "next";
import ShaftLandingContent from "@/components/shaft/ShaftLandingContent";
import { localeAlternates } from "@/lib/locale-routes";

/** The portfolio in Spanish. Same page as `/`, resolved server-side. */
export const metadata: Metadata = {
  alternates: localeAlternates("es"),
};

export default function LandingPageES() {
  return <ShaftLandingContent locale="es" />;
}
