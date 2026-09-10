/**
 * The reasoning behind `npm run doctor`, separated from the talking to
 * Postgres so it can be tested.
 *
 * A client space is visible only when a chain of things are all true, and
 * when any one of them isn't, the visitor gets the same blank 404. These
 * functions take the facts the script gathered and say which link is broken —
 * that judgement is the part worth getting right, so it lives here with the
 * other pure modules rather than inside a script nothing can exercise.
 */

export type Severity = "ok" | "warn" | "fail";

export type Finding = {
  severity: Severity;
  message: string;
  detail?: string;
};

export type ClientFacts = {
  slug: string;
  /** The 1:1 client_pages row, if the provisioning trigger made one. */
  page: { published: boolean; display_name: string | null } | null;
  /** Whether anyone can sign in as this client. */
  hasUser: boolean;
};

/**
 * Why one `/c/{slug}` does or doesn't render for a logged-out visitor.
 *
 * Ordered by what blocks what: a missing page row makes the published flag
 * meaningless, so it is reported instead of alongside.
 */
export function diagnoseClient(facts: ClientFacts): Finding {
  const path = `/c/${facts.slug}`;

  if (!facts.page) {
    return {
      severity: "fail",
      message: `${path} has no client_pages row`,
      detail:
        "The provisioning trigger didn't fire for this client. Nothing can " +
        "render until a row exists.",
    };
  }

  if (!facts.page.published) {
    return {
      severity: "warn",
      message: `${path} is not published`,
      detail:
        "A logged-out visitor gets a 404 here — this is the most common " +
        "reason a pitch link looks broken. Publish it under Pitch page in " +
        "the admin console.",
    };
  }

  return {
    severity: "ok",
    message: `${path} is published`,
    detail: facts.page.display_name ?? undefined,
  };
}

/**
 * The state of the whole install, from the counts the script gathered.
 *
 * Deliberately opinionated about order: no admin means nobody can create a
 * client, and no client means every slug is a 404, so those come before
 * anything about individual pages.
 */
export function diagnoseInstall(counts: {
  admins: number;
  clients: number;
  publishedPages: number;
  invitedClients: number;
}): Finding[] {
  const out: Finding[] = [];

  if (counts.admins === 0) {
    out.push({
      severity: "fail",
      message: "no admin profile",
      detail:
        "Nobody can open /admin, so nobody can create a client or publish a " +
        "page. Sign in once at /login, then run `npm run admin -- you@example.com`. " +
        "Setting profiles.role alone is not enough: middleware gates /admin on " +
        "the role claim in the JWT. See docs/setup.md step 4.",
    });
  } else {
    out.push({ severity: "ok", message: `${counts.admins} admin` });
  }

  if (counts.clients === 0) {
    out.push({
      severity: "fail",
      message: "no clients",
      detail:
        "This is why /c/<anything> is a 404: there is nothing to serve. " +
        "Create one in the admin console.",
    });
    return out;
  }

  out.push({ severity: "ok", message: `${counts.clients} clients` });

  if (counts.publishedPages === 0) {
    out.push({
      severity: "warn",
      message: "no published pages",
      detail:
        "Every client space 404s for anyone not signed in. The rows exist; " +
        "the published flag is off.",
    });
  }

  if (counts.invitedClients === 0) {
    out.push({
      severity: "warn",
      message: "no client has a signed-in user yet",
      detail:
        "The pitch half works, the portal half has nobody to show it to.",
    });
  }

  return out;
}

/** True when nothing needs the operator's attention. */
export function isHealthy(findings: Finding[]): boolean {
  return findings.every((f) => f.severity === "ok");
}

/** Exit code: non-zero only for genuine failures, not warnings. */
export function exitCode(findings: Finding[]): number {
  return findings.some((f) => f.severity === "fail") ? 1 : 0;
}
