import { requireClientModule } from "@/lib/os/client-scope";
import { getThreadForClient } from "@/lib/os/messages";
import { MessageThread } from "@/components/os/MessageThread";
import { routes } from "@/lib/routes";

export const metadata = { title: "Messages — Shaft OS" };

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scope = await requireClientModule(
    slug,
    "messaging",
    routes.client.messages(slug),
  );
  const messages = await getThreadForClient(scope.client.id);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">{routes.client.messages(slug)}</p>
      <h1 className="os-title">Messages</h1>
      <p className="os-sub">
        A direct line to the team. Messages appear live, and you can share files.
      </p>

      <MessageThread
        clientId={scope.client.id}
        initial={messages}
        viewerIsAdmin={scope.access === "admin"}
      />
    </main>
  );
}
