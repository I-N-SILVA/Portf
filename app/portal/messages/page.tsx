import { getClientThread } from "@/lib/os/messages";
import { MessageThread } from "@/components/os/MessageThread";

export const metadata = { title: "Messages — Shaft OS" };

export default async function MessagesPage() {
  const { clientId, messages } = await getClientThread();

  return (
    <main className="os-stage">
      <p className="os-eyebrow">portal · messages</p>
      <h1 className="os-title">Messages</h1>
      <p className="os-sub">
        A direct line to the team. Messages appear live, and you can share files.
      </p>

      {clientId ? (
        <MessageThread clientId={clientId} initial={messages} viewerIsAdmin={false} />
      ) : (
        <p className="os-empty">Messaging isn&apos;t set up for your account yet.</p>
      )}
    </main>
  );
}
