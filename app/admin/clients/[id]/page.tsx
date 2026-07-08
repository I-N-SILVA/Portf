import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProjectsForClient, projectProgress } from "@/lib/os/projects";
import {
  MILESTONE_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
  milestoneTone,
} from "@/lib/os/labels";
import type { Client } from "@/lib/supabase/types";
import {
  AddMilestoneForm,
  MarkReadyButton,
  NewProjectForm,
} from "./ProjectAdmin";

export const metadata = { title: "Client — Shaft OS Admin" };

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!client) notFound();

  const c = client as Client;
  const projects = await getProjectsForClient(id);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">
        <Link href="/clients" style={{ color: "inherit" }}>
          ← Clients
        </Link>
      </p>
      <h1 className="os-title">{c.name}</h1>
      <p className="os-sub">
        {c.company ? `${c.company} · ` : ""}
        {c.email}
      </p>

      <div className="os-statline" style={{ marginBottom: "36px" }}>
        <div className="os-stat">
          <div className="n" style={{ textTransform: "capitalize" }}>
            {c.status}
          </div>
          <div className="k">Status</div>
        </div>
        <div className="os-stat">
          <div className="n" style={{ textTransform: "capitalize" }}>
            {c.tier}
          </div>
          <div className="k">Tier</div>
        </div>
        <div className="os-stat">
          <div className="n">{projects.length}</div>
          <div className="k">Projects</div>
        </div>
      </div>

      <div className="os-sec">
        Projects
        <span style={{ marginLeft: "auto", textTransform: "none" }}>
          <NewProjectForm clientId={id} />
        </span>
      </div>

      {projects.length === 0 ? (
        <p className="os-empty">
          No projects yet. Create one to start tracking milestones.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {projects.map((p) => (
            <div key={p.id} className="os-tablewrap" style={{ padding: "18px" }}>
              <div
                className="os-ms-head"
                style={{ marginBottom: "12px", alignItems: "center" }}
              >
                <span className="os-ms-name" style={{ fontSize: "15px" }}>
                  {p.name}
                </span>
                <span className="os-note dim" style={{ fontSize: "10.5px" }}>
                  {PROJECT_STATUS_LABEL[p.status]} · {projectProgress(p)}%
                </span>
              </div>

              {p.milestones.length === 0 ? (
                <p className="os-empty" style={{ margin: "0 0 4px" }}>
                  No milestones yet.
                </p>
              ) : (
                <ol className="os-timeline">
                  {p.milestones.map((m) => (
                    <li
                      key={m.id}
                      className="os-ms"
                      data-flagged={m.status === "ready_for_review"}
                    >
                      <div className="os-ms-head">
                        <span className="os-ms-name">{m.name}</span>
                        <span
                          className={`os-note ${milestoneTone(m.status)}`}
                          style={{ fontSize: "10.5px" }}
                        >
                          {MILESTONE_STATUS_LABEL[m.status]}
                        </span>
                      </div>
                      <div className="os-ms-meta">
                        <span>Due {fmtDate(m.due_date)}</span>
                        {m.response_comment && (
                          <span>“{m.response_comment}”</span>
                        )}
                      </div>
                      {(m.status === "in_progress" ||
                        m.status === "pending" ||
                        m.status === "rejected") && (
                        <div style={{ marginTop: "12px" }}>
                          <MarkReadyButton clientId={id} milestoneId={m.id} />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              <AddMilestoneForm
                clientId={id}
                projectId={p.id}
                nextPosition={p.milestones.length}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
