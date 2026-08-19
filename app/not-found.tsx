import { StatusScreen } from "@/components/ui/StatusScreen";
import { routes } from "@/lib/routes";
import Link from "next/link";

/**
 * Catches every notFound() in the app, including the deliberate 404 a client
 * space returns for a slug the visitor isn't allowed to know exists — so the
 * copy stays neutral about whether the thing is missing or merely hidden.
 */
export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="There's nothing at this address"
      message="The link may have expired, or it may point somewhere you need to be signed in to reach."
    >
      <Link
        href={routes.auth.login}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Sign in
      </Link>
    </StatusScreen>
  );
}
