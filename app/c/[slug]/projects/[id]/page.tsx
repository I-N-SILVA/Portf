import { notFound } from "next/navigation";
import Link from "next/link";
import { requireClientModule } from "@/lib/os/client-scope";
import { getProjectDetail, projectProgress } from "@/lib/os/projects";
import { routes } from "@/lib/routes";
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
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const scope = await requireClientModule(
    slug,
    "projects",
    routes.client.project(slug, id),
  );
  const project = await getProjectDetail(id);
  // RLS lets an admin read any project, so the space's own scope has to be
  // the thing that decides — otherwise /c/acme/projects/<other-id> would
  // render another client's work under Acme's chrome.
  if (!project || project.client_id !== scope.client.id) notFound();

  const pct = projectProgress(project);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">
        <Link href={routes.client.projects(slug)} style={{ color: "inherit" }}>
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
                  <MilestoneReview slug={slug} milestoneId={m.id} />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
