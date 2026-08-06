import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveClientScope } from "@/lib/os/client-scope";
import { ClientDashboard } from "@/components/os/ClientDashboard";
import PitchPage from "@/components/studio/PitchPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const scope = await resolveClientScope(slug);
  if (scope.access === "public") {
    return { title: `Prepared for ${scope.page.display_name}` };
  }
  if (scope.access === "none") return {};
  return { title: `${scope.client.company ?? scope.client.name} — Shaft OS` };
}

/**
 * The client's front door. Which face it shows depends on who's knocking —
 * see lib/os/client-scope.ts. The layout resolves the same (cached) scope to
 * pick the chrome, so the two can't disagree.
 */
export default async function ClientSpacePage({ params }: PageProps) {
  const { slug } = await params;
  const scope = await resolveClientScope(slug);

  switch (scope.access) {
    case "public":
      return <PitchPage page={scope.page} />;
    case "owner":
      return <ClientDashboard client={scope.client} logVisit />;
    case "admin":
      return <ClientDashboard client={scope.client} logVisit={false} />;
    default:
      notFound();
  }
}
