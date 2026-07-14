import { createClient } from "@/lib/supabase/server";
import type { Milestone, Project } from "@/lib/supabase/types";

export type ProjectWithMilestones = Project & { milestones: Milestone[] };

function byPosition(a: Milestone, b: Milestone) {
  return a.position - b.position || a.created_at.localeCompare(b.created_at);
}

async function attachMilestones(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projects: Project[],
): Promise<ProjectWithMilestones[]> {
  if (projects.length === 0) return [];
  const ids = projects.map((p) => p.id);
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .in("project_id", ids);

  const grouped = new Map<string, Milestone[]>();
  for (const m of (milestones ?? []) as Milestone[]) {
    const list = grouped.get(m.project_id) ?? [];
    list.push(m);
    grouped.set(m.project_id, list);
  }
  return projects.map((p) => ({
    ...p,
    milestones: (grouped.get(p.id) ?? []).sort(byPosition),
  }));
}

/** Projects for the signed-in client (RLS scopes to their own). */
export async function getClientProjects(): Promise<ProjectWithMilestones[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  return attachMilestones(supabase, (data ?? []) as Project[]);
}

/** Projects for a specific client — admin view. */
export async function getProjectsForClient(
  clientId: string,
): Promise<ProjectWithMilestones[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return attachMilestones(supabase, (data ?? []) as Project[]);
}

/** A single project with milestones (RLS enforces access). */
export async function getProjectDetail(
  projectId: string,
): Promise<ProjectWithMilestones | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (!data) return null;
  const [withMs] = await attachMilestones(supabase, [data as Project]);
  return withMs;
}

/** Dashboard summary: how many projects, how many awaiting the client. */
export function summarise(projects: ProjectWithMilestones[]) {
  const flagged = projects.reduce(
    (n, p) =>
      n + p.milestones.filter((m) => m.status === "ready_for_review").length,
    0,
  );
  const active = projects.filter(
    (p) => p.status === "in_progress" || p.status === "review",
  ).length;
  return { total: projects.length, active, flagged };
}

/** Fraction of milestones approved/complete → a simple progress %. */
export function projectProgress(p: ProjectWithMilestones): number {
  if (p.milestones.length === 0) return p.status === "complete" ? 100 : 0;
  const done = p.milestones.filter(
    (m) => m.status === "approved" || m.status === "complete",
  ).length;
  return Math.round((done / p.milestones.length) * 100);
}
