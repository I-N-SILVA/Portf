"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/supabase/types";

export function NotificationBell() {
  const supabaseRef = useRef(createClient());
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const unread = items.filter((n) => !n.read_at).length;

  const load = useCallback(async (uid: string) => {
    const { data } = await supabaseRef.current
      .from("notifications")
      .select("*")
      .eq("recipient_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data ?? []) as AppNotification[]);
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await load(user.id);

      channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => setItems((prev) => [payload.new as AppNotification, ...prev]),
        )
        .subscribe();
    })().catch((err) => {
      // Realtime is an enhancement — the bell still renders whatever the
      // initial load returned. Failing to subscribe must not blank it.
      console.error("NotificationBell: subscribe failed", err);
    });

    return () => {
      if (channel) void supabase.removeChannel(channel).catch(() => {});
    };
  }, [load]);

  const markAllRead = async () => {
    if (!userId || unread === 0) return;
    const nowIso = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: nowIso })));
    await supabaseRef.current
      .from("notifications")
      .update({ read_at: nowIso })
      .eq("recipient_id", userId)
      .is("read_at", null);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void markAllRead();
  };

  return (
    <div className="os-bell-wrap">
      <button className="os-chip os-bell" onClick={toggle} aria-label="Notifications">
        ◔
        {unread > 0 && <span className="os-bell-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="os-bell-panel">
          {items.length === 0 ? (
            <div className="os-bell-empty">No notifications.</div>
          ) : (
            items.map((n) => (
              <div key={n.id} className="os-bell-item">
                <div className="os-bell-msg">
                  {String((n.payload as { message?: string }).message ?? n.type)}
                </div>
                <div className="os-bell-time">
                  {new Date(n.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
