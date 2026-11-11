import { SITE } from "@/lib/constants";
import { INTAKE_FAQ } from "@/lib/offers";
import { BOOKING } from "@/lib/booking";
import { SERVICES } from "@/lib/services";
import { LAB, PRODUCTS } from "@/lib/work";
import { caseStudies } from "@/lib/client-content";
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
  const mvp = SERVICES.mvp;
  const landing = SERVICES.landing;
  const external = (href: string) => (/^https?:/.test(href) ? href : siteUrl(href));

  const body = [
    `# ${SITE.NAME}`,
    "",
    `> ${SITE.DESCRIPTION}`,
    "",
    "Ian N. Silva is a UK-based developer who builds fixed-price MVPs and landing pages for founders and small businesses. He works remotely with clients across the UK, London included.",
    "",
    `- Site: ${SITE.URL}`,
    `- Book a free 20-minute call: ${BOOKING.fitCall}`,
    `- Email: ${SITE.EMAIL}`,
    "",
    "## Services and prices (GBP, fixed price)",
    "",
    ...[mvp, landing].flatMap((s) => [
      `### ${s.serviceType}: ${siteUrl(s.slug)}`,
      "",
      ...s.tiers.map((t) => `- **${t.name}**: ${t.price}, ${t.timeline}. Includes: ${t.includes.join("; ")}.`),
      "",
    ]),
    "Payment: MVP Sprints are 50% to start and 50% on launch. Landing pages are paid upfront. Extras (logo, more pages, copywriting) are quoted on the call before anything starts. The client owns the code from day one.",
    "",
    "## Common questions",
    "",
    ...[...INTAKE_FAQ.map(({ question, answer }) => ({ q: question, a: answer })), ...mvp.answers, ...mvp.faq, ...landing.answers, ...landing.faq].flatMap(({ q, a }) => [`### ${q}`, "", a, ""]),
    "## Selected work",
    "",
    ...PRODUCTS.map((p) => `- **${p.name}** (${p.role}): ${p.summary} ${external(p.url)}`),
    "",
    "## The lab (tools Ian builds for himself)",
    "",
    ...LAB.map((l) => `- **${l.name}** (${l.stack.join(", ")}; ${l.status === "oss" ? "open source" : l.status}): ${l.summary}${l.url ? ` ${l.url}` : ""}`),
    "",
    "## Case studies",
    "",
    ...caseStudies.map(
      (study) =>
        `- **${study.headline}** (${study.industry}): ${study.problem} ${siteUrl(routes.studio.work(study.slug))}`,
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
