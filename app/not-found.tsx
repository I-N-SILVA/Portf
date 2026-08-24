import Link from "next/link";
import { routes } from "@/lib/routes";

export const metadata = { title: "Not found — Ian N. Silva" };

/**
 * The site-wide 404. There was none, so `notFound()` — which the client-scope
 * resolver calls for every unknown slug — rendered Next's unstyled default on
 * a domain a prospect may have been sent.
 */
export default function NotFound() {
  return (
    <main className="shaft-fallback">
      <p className="shaft-fallback-eyebrow">Error 404</p>
      <h1 className="shaft-fallback-title">Nothing filed here.</h1>
      <p className="shaft-fallback-body">
        The page you asked for doesn&apos;t exist, or was never public.
      </p>
      <div className="shaft-fallback-actions">
        <Link className="shaft-fallback-link" href={routes.home}>
          Portfolio
        </Link>
        <Link className="shaft-fallback-link" href={routes.studio.root}>
          Studio
        </Link>
      </div>
    </main>
  );
}
