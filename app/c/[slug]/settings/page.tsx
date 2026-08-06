import { Placeholder } from "@/components/os/Placeholder";
import { requireClientScope } from "@/lib/os/client-scope";
import { routes } from "@/lib/routes";

export const metadata = { title: "Settings — Shaft OS" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireClientScope(slug, routes.client.settings(slug));

  return (
    <Placeholder
      eyebrow={routes.client.settings(slug)}
      title="Settings"
      note="Manage your profile and notification preferences."
    />
  );
}
