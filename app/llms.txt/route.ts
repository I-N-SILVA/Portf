import { SITE } from "@/lib/constants";
import { INTAKE_FAQ, OFFERS } from "@/lib/offers";
import { caseStudies } from "@/lib/client-content";
import { projects } from "@/lib/placeholder-content";
import { routes, siteUrl } from "@/lib/routes";

/**
 * /llms.txt — a plain-text brief for language models.
 *
 * The convention is robots.txt's counterpart: rather than telling a crawler
 * where it may go, it tells a model what is here, in the order a person
 * would want it summarised. A model that fetches this gets the offering, the
 * work and the way in without having to infer any of it from a page whose
 * content is spread across an interactive drawer and a drag-to-browse reel.
 *
 * It is a route rather than a file in public/ for the same reason robots is:
 * every fact in it already exists somewhere in the codebase, so generating it
 * means it cannot fall out of date with the site it describes.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const live = projects.filter((project) => !project.retired);

  const body = [
    `# ${SITE.NAME}`,
    "",
    `> ${SITE.DESCRIPTION}`,
    "",
    `Contact: ${SITE.EMAIL}`,
    `Site: ${SITE.URL}`,
    "",
    "## What this studio does",
    "",
    ...OFFERS.map((offer) => `- **${offer.name}** — ${offer.description}`),
    "",
    "Typical engagement is two to four weeks. Work is remote and worldwide.",
    "",
    "## Common questions",
    "",
    ...INTAKE_FAQ.flatMap(({ question, answer }) => [
      `### ${question}`,
      "",
      answer,
      "",
    ]),
    "## Selected work",
    "",
    ...live.map(
      (project) =>
        `- **${project.title}** (${project.category}) — ${project.description} ${siteUrl(`/projects/${project.id}`)}`,
    ),
    "",
    "## Case studies",
    "",
    ...caseStudies.map(
      (study) =>
        `- **${study.headline}** (${study.industry}) — ${study.problem} ${siteUrl(routes.studio.work(study.slug))}`,
    ),
    "",
    "## Not for indexing",
    "",
    "Client workspaces (/c/*), the client portal and the admin console are private.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
