import Link from "next/link";
import { getClientProjects, projectProgress } from "@/lib/os/projects";
import { PROJECT_STATUS_LABEL } from "@/lib/os/labels";

export const metadata = { title: "Projects — Shaft OS" };

export default async function ProjectsPage() {
  const projects = await getClientProjects();

  return (
    <main className="os-stage">
      <p className="os-eyebrow">portal · projects</p>
      <h1 className="os-title">Projects</h1>
      <p className="os-sub">
        Every piece of work we&apos;re doing together, with its milestones. When
        something&apos;s ready for your sign-off, it&apos;s flagged.
      </p>

      <div className="os-sec">Active &amp; recent</div>

      {projects.length === 0 ? (
        <div className="os-tablewrap">
          <table className="os-table">
            <tbody>
              <tr>
                <td className="os-table-empty">
                  No projects yet. New work will appear here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="os-grid">
          {projects.map((p) => {
            const flagged = p.milestones.filter(
              (m) => m.status === "ready_for_review",
            ).length;
            const pct = projectProgress(p);
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="os-win"
                data-flagged={flagged > 0}
                style={{ textDecoration: "none" }}
              >
                <div className="os-win-bar">
                  {p.name}
                  {flagged > 0 && (
                    <span className="badge">{flagged} to review</span>
                  )}
                  <span className="chev">→</span>
                </div>
                <div className="os-win-body">
                  <div className="os-row">
                    <span className="label">Status</span>
                    <span className="val">{PROJECT_STATUS_LABEL[p.status]}</span>
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <div className="os-row" style={{ marginBottom: "7px" }}>
                      <span className="label">Progress</span>
                      <span className="val">{pct}%</span>
                    </div>
                    <div className="os-bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
