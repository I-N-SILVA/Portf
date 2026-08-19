/**
 * Every URL the app builds, in one place.
 *
 * The whole site runs on a single origin — no subdomains. Areas are separated
 * by their first path segment, so the public path and the App Router path are
 * always identical. That equivalence is what makes `revalidatePath()` and
 * `<Link href>` correct without any host-aware translation layer.
 *
 *   /                    marketing portfolio
 *   /studio              public studio: services, case studies, process, FAQ
 *   /c/{slug}            one client's whole space (pitch page → portal)
 *   /admin               ops console
 *   /login …             auth
 *
 * Import from here instead of hardcoding strings: moving an area again means
 * editing this file, not grepping for path literals.
 */

/**
 * First path segments that can never be a client slug, because a client space
 * at /c/{slug} shares no namespace with them today but might tomorrow — and
 * because these read as system pages to a human. Mirrored by the
 * `clients_slug_format` CHECK constraint in 0008_client_slugs.sql; change both
 * together.
 */
/** Fallback origin when NEXT_PUBLIC_SITE_URL is unset. */
export const DEFAULT_SITE_URL = "https://iamnsilva.me";

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "auth",
  "login",
  "logout",
  "studio",
  "portal",
  "work",
  "new",
  "settings",
  "reset-password",
  "set-password",
  "sitemap",
  "robots",
] as const;

/** Path-safe, lowercase, hyphen-separated. Mirrors public.slugify() in SQL. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return (
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) &&
    slug.length >= 2 &&
    slug.length <= 48 &&
    !(RESERVED_SLUGS as readonly string[]).includes(slug)
  );
}

export const routes = {
  home: "/",

  /** Public, indexable. The studio sells; it never shows client data. */
  studio: {
    root: "/studio",
    section: (id: "services" | "work" | "process" | "about" | "faq" | "contact") =>
      `/studio#${id}`,
    work: (caseSlug: string) => `/studio/work/${caseSlug}`,
  },

  /**
   * One client's space. The root is public when their page is published
   * (noindex — shared by link, not found by search); everything below it
   * requires a session belonging to that client, or an admin.
   */
  client: {
    root: (slug: string) => `/c/${slug}`,
    projects: (slug: string) => `/c/${slug}/projects`,
    project: (slug: string, id: string) => `/c/${slug}/projects/${id}`,
    billing: (slug: string) => `/c/${slug}/billing`,
    billingPortal: (slug: string) => `/c/${slug}/billing/portal`,
    bookings: (slug: string) => `/c/${slug}/bookings`,
    messages: (slug: string) => `/c/${slug}/messages`,
    settings: (slug: string) => `/c/${slug}/settings`,
  },

  admin: {
    root: "/admin",
    clients: "/admin/clients",
    client: (id: string) => `/admin/clients/${id}`,
    engagement: "/admin/engagement",
    nudges: "/admin/nudges",
    analytics: "/admin/analytics",
    settings: "/admin/settings",
  },

  auth: {
    login: "/login",
    loginNext: (next: string) => `/login?next=${encodeURIComponent(next)}`,
    resetPassword: "/reset-password",
    setPassword: "/set-password",
  },
} as const;

/**
 * Sanitise a `?next=` parameter before redirecting to it. Only same-origin
 * absolute paths survive: anything with a scheme, and anything starting `//`
 * (which a browser reads as protocol-relative), would let a crafted login
 * link bounce a signed-in client straight off the site.
 */
export function safeNext(next: string | undefined, fallback = "/portal"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/** Absolute URL for emails, webhooks, and metadata. */
export function siteUrl(path = "/"): string {
  // Read through process.env rather than lib/env's cached literal: the tests
  // set NEXT_PUBLIC_SITE_URL at runtime, and a module-scope constant would
  // have frozen the default before they got the chance.
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  ).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Legacy subdomain → path mapping, applied as a redirect in middleware so
 * existing DNS records, bookmarks and links sent to clients keep working.
 */
export const LEGACY_SUBDOMAIN_AREAS: Record<string, string> = {
  portal: "/portal", // resolved to /c/{slug} by app/portal/[[...rest]]
  admin: "/admin",
  clients: "/studio",
  work: "/studio",
};
