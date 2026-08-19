"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markThreadRead } from "@/lib/os/actions/messages";
import type { Message } from "@/lib/supabase/types";

/**
 * Realtime per-client thread, shared by the portal and admin. `viewerIsAdmin`
 * only affects bubble alignment; all auth is enforced server-side.
 */
export function MessageThread({
  clientId,
  initial,
  viewerIsAdmin,
}: {
  clientId: string;
  initial: Message[];
  viewerIsAdmin: boolean;
}) {
  const supabaseRef = useRef(createClient());
  const [messages, setMessages] = useState<Message[]>(initial);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    void markThreadRead(clientId);
    const channel = supabase
      .channel(`messages:${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
        },
      )
      .subscribe();
    // A cleanup function can't be async, and a teardown that rejects (the
    // socket already gone, the tab backgrounded) is not worth an unhandled
    // rejection in the console.
    return () => {
      void supabase.removeChannel(channel).catch(() => {});
    };
  }, [clientId]);

  const openAttachment = async (path: string) => {
    const { data } = await supabaseRef.current.storage
      .from("attachments")
      .createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };

  const send = async () => {
    if (!body.trim() && !file) return;
    setBusy(true);
    setError("");
    let attachmentPath: string | null = null;
    let attachmentName: string | null = null;

    if (file) {
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${clientId}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabaseRef.current.storage
        .from("attachments")
        .upload(path, file);
      if (upErr) {
        setBusy(false);
        setError(upErr.message);
        return;
      }
      attachmentPath = path;
      attachmentName = file.name;
    }

    const res = await sendMessage({
      clientId,
      body,
      attachmentPath,
      attachmentName,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't send.");
      return;
    }
    setBody("");
    setFile(null);
  };

  return (
    <div className="os-thread">
      <div className="os-thread-scroll">
        {messages.length === 0 ? (
          <p className="os-empty" style={{ padding: "20px" }}>
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_is_admin === viewerIsAdmin;
            return (
              <div key={m.id} className={`os-bubble${mine ? " mine" : ""}`}>
                {m.body && <div className="os-bubble-body">{m.body}</div>}
                {m.attachment_path && (
                  <button
                    className="os-bubble-file"
                    onClick={() => openAttachment(m.attachment_path!)}
                  >
                    ⎘ {m.attachment_name ?? "attachment"}
                  </button>
                )}
                <div className="os-bubble-time">
                  {new Date(m.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="os-msg err">{error}</p>}
      <div className="os-composer">
        <input
          className="os-input"
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <label className="os-btn" style={{ cursor: "pointer" }}>
          {file ? "1 file" : "Attach"}
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button className="os-btn primary" disabled={busy} onClick={send}>
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
