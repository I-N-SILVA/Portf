import type { Metadata } from "next";
import ShaftLandingContent from "@/components/shaft/ShaftLandingContent";
import { localeAlternates } from "@/lib/locale-routes";

/** The portfolio in Chinese. Same page as `/`, resolved server-side. */
export const metadata: Metadata = {
  alternates: localeAlternates("zh"),
};

export default function LandingPageZH() {
  return <ShaftLandingContent locale="zh" />;
}
