import { createClient } from "@/lib/supabase/server";
import type { ClientPage } from "@/lib/supabase/types";

export type PitchSummary = {
  clientId: string;
  slug: string;
  displayName: string;
  published: boolean;
  viewCount: number;
  visitorCount: number;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  /** Whole days since it was last opened; null when never opened. */
  daysSinceView: number | null;
  /** Whole days since it was published/updated and still unopened. */
  daysUnopened: number | null;
};

const DAY_MS = 86_400_000;
const days = (from: string, now: number) =>
  Math.floor((now - new Date(from).getTime()) / DAY_MS);

export function summarisePitch(
  page: ClientPage & { slug: string },
  now: number = Date.now(),
): PitchSummary {
  return {
    clientId: page.client_id,
    slug: page.slug,
    displayName: page.display_name,
    published: page.published,
    viewCount: page.view_count,
    visitorCount: page.visitor_count,
    firstViewedAt: page.first_viewed_at,
    lastViewedAt: page.last_viewed_at,
    daysSinceView: page.last_viewed_at ? days(page.last_viewed_at, now) : null,
    daysUnopened: page.last_viewed_at ? null : days(page.updated_at, now),
  };
}

/**
 * Published pitch pages, coldest first — the ones sent longest ago and still
 * unopened sit at the top, because those are the follow-ups worth making.
 */
export async function getLivePitches(
  now: number = Date.now(),
): Promise<PitchSummary[]> {
  const supabase = await createClient();

  // Two queries rather than a PostgREST embed: lib/supabase/types.ts is
  // hand-authored with empty Relationships, so `client_pages(clients(slug))`
  // has no type to resolve against. Both sides are admin-scoped and small.
  const { data: pages } = await supabase
    .from("client_pages")
    .select("*")
    .eq("published", true);

  const rows = (pages ?? []) as ClientPage[];
  if (rows.length === 0) return [];

  const { data: clients } = await supabase
    .from("clients")
    .select("id, slug")
    .in("id", rows.map((p) => p.client_id));

  const slugById = new Map(
    ((clients ?? []) as { id: string; slug: string }[]).map((c) => [c.id, c.slug]),
  );

  return rows
    .map((row) =>
      summarisePitch({ ...row, slug: slugById.get(row.client_id) ?? "" }, now),
    )
    .filter((p) => p.slug)
    .sort((a, b) => {
      // Unopened before opened; within each group, longest wait first.
      if (a.lastViewedAt === null && b.lastViewedAt !== null) return -1;
      if (a.lastViewedAt !== null && b.lastViewedAt === null) return 1;
      return (b.daysUnopened ?? b.daysSinceView ?? 0) -
        (a.daysUnopened ?? a.daysSinceView ?? 0);
    });
}

/** Human phrasing for the state a pitch is in. */
export function pitchStatusLabel(p: PitchSummary): {
  text: string;
  tone: "gold" | "dim" | "accent";
} {
  if (p.viewCount === 0) {
    const d = p.daysUnopened ?? 0;
    if (d >= 7) {
      return { text: `Unopened · ${d}d`, tone: "accent" };
    }
    return { text: d <= 0 ? "Unopened · today" : `Unopened · ${d}d`, tone: "gold" };
  }
  const d = p.daysSinceView ?? 0;
  if (d === 0) return { text: "Read today", tone: "gold" };
  if (d === 1) return { text: "Read yesterday", tone: "gold" };
  return { text: `Read ${d}d ago`, tone: "dim" };
}
