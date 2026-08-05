import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminUnreadByClient } from "@/lib/os/messages";
import type { Client } from "@/lib/supabase/types";
import { routes } from "@/lib/routes";

export const metadata = { title: "Clients — Shaft OS Admin" };

const STATUS_CLASS: Record<string, string> = {
  active: "gold",
  paused: "",
  churned: "accent",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const clients = (data ?? []) as Client[];
  const unread = await adminUnreadByClient();

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · clients</p>
      <h1 className="os-title">Clients</h1>
      <p className="os-sub">
        Everyone you work with. Create a client, set their tier and modules,
        then send an invite to open their space.
      </p>

      <div className="os-sec">
        Directory
        <span style={{ marginLeft: "auto", textTransform: "none" }}>
          <button className="os-btn">+ New client</button>
        </span>
      </div>

      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={4}>
                  No clients yet. Add your first to get started.
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={routes.admin.client(c.id)}
                      style={{ color: "var(--os-ink)", textDecoration: "none" }}
                    >
                      {c.name}
                    </Link>
                    {unread[c.id] > 0 && (
                      <span className="badge" style={{ marginLeft: "8px" }}>
                        {unread[c.id]} new
                      </span>
                    )}
                    <div
                      style={{
                        color: "var(--os-muted)",
                        fontSize: "10px",
                        letterSpacing: "0.04em",
                        marginTop: "3px",
                      }}
                    >
                      {c.company && (
                        <span style={{ textTransform: "uppercase" }}>
                          {c.company} ·{" "}
                        </span>
                      )}
                      <Link
                        href={routes.client.root(c.slug)}
                        style={{ color: "inherit" }}
                      >
                        {routes.client.root(c.slug)}
                      </Link>
                    </div>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{c.tier}</td>
                  <td>
                    <span
                      className={`os-note ${STATUS_CLASS[c.status] ?? "dim"}`}
                      style={{ fontSize: "10px" }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--os-muted)" }}>
                    {new Date(c.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
