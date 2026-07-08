import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectDetail, projectProgress } from "@/lib/os/projects";
import {
  MILESTONE_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
  milestoneTone,
} from "@/lib/os/labels";
import { MilestoneReview } from "./MilestoneReview";

export const metadata = { title: "Project — Shaft OS" };

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  const pct = projectProgress(project);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">
        <Link href="/projects" style={{ color: "inherit" }}>
          ← Projects
        </Link>
      </p>
      <h1 className="os-title">{project.name}</h1>
      {project.description && <p className="os-sub">{project.description}</p>}

      <div className="os-statline" style={{ marginBottom: "36px" }}>
        <div className="os-stat">
          <div className="n">{PROJECT_STATUS_LABEL[project.status]}</div>
          <div className="k">Status</div>
        </div>
        <div className="os-stat">
          <div className="n">{pct}%</div>
          <div className="k">Progress</div>
        </div>
        <div className="os-stat">
          <div className="n">{project.milestones.length}</div>
          <div className="k">Milestones</div>
        </div>
      </div>

      <div className="os-sec">Milestones</div>

      {project.milestones.length === 0 ? (
        <p className="os-empty">No milestones yet.</p>
      ) : (
        <ol className="os-timeline">
          {project.milestones.map((m) => (
            <li key={m.id} className="os-ms" data-flagged={m.status === "ready_for_review"}>
              <div className="os-ms-head">
                <span className="os-ms-name">{m.name}</span>
                <span className={`os-note ${milestoneTone(m.status)}`} style={{ fontSize: "10.5px" }}>
                  {MILESTONE_STATUS_LABEL[m.status]}
                </span>
              </div>
              {m.description && <p className="os-ms-desc">{m.description}</p>}
              <div className="os-ms-meta">
                <span>Due {fmtDate(m.due_date)}</span>
                {m.responded_at && (
                  <span>
                    {m.status === "approved" ? "Signed off" : "Changes requested"}{" "}
                    {fmtDate(m.responded_at)}
                  </span>
                )}
              </div>
              {m.response_comment && (
                <p className="os-ms-comment">“{m.response_comment}”</p>
              )}
              {m.status === "ready_for_review" && (
                <div style={{ marginTop: "14px" }}>
                  <MilestoneReview milestoneId={m.id} />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
