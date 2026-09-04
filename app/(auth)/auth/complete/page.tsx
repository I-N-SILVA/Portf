import { safeNext } from "@/lib/routes";
import { AuthCompletion } from "./AuthCompletion";

export const metadata = {
  title: "Completing sign in — Shaft OS",
  robots: { index: false, follow: false },
};

export default async function AuthCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthCompletion next={safeNext(next)} />;
}
