import Link from "next/link";

/**
 * Shown when an admin opens a client's space at /c/{slug}. Nothing here is
 * hidden from the client — the point is to stop the admin forgetting whose
 * screen they're reading and mistaking it for their own console.
 */
export function AdminViewBanner({
  clientName,
  adminHref,
}: {
  clientName: string;
  adminHref: string;
}) {
  return (
    <div className="os-adminview" role="status">
      <span>
        Admin view — this is <b>{clientName}</b>&apos;s space, exactly as they
        see it.
      </span>
      <Link href={adminHref}>Back to their admin record →</Link>
    </div>
  );
}
