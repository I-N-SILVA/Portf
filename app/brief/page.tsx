import type { Metadata } from "next";
import BriefPage from "./BriefPage";

/** Unlisted project brief Ian sends to prospects. Not linked, not indexed. */
export const metadata: Metadata = {
  title: "Project brief · Ian N. Silva",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BriefPage />;
}
