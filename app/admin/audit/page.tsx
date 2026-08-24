import Link from "next/link";
import { getAuditLog, formatAuditDetail, AUDIT_PAGE_SIZE } from "@/lib/os/audit";
import { AUDIT_LABEL } from "@/lib/os/labels";
import { routes } from "@/lib/routes";

export const metadata = { title: "Audit — Shaft OS Admin" };

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(0, Number.parseInt(rawPage ?? "0", 10) || 0);
  const { rows, hasMore } = await getAuditLog(page);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · audit</p>
      <h1 className="os-title">Audit trail</h1>
      <p className="os-sub">
        Every admin action against a client record, oldest at the bottom.
        Written by <code>log_admin_action</code> and never editable from the
        app — the table has a read policy and no write policy.
      </p>

      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Did what</th>
              <th>To</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={5}>
                  {page === 0
                    ? "Nothing recorded yet. Editing a client, publishing a pitch, creating a project or raising an invoice all land here."
                    : "No further entries."}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const detail = formatAuditDetail(r.detail);
                return (
                  <tr key={r.id}>
                    <td style={{ color: "var(--os-muted)", whiteSpace: "nowrap" }}>
                      {fmtWhen(r.created_at)}
                    </td>
                    <td style={{ color: "var(--os-ink)" }}>{r.actorName}</td>
                    <td style={{ color: "var(--os-ink)" }}>
                      {AUDIT_LABEL[r.action] ?? r.action}
                    </td>
                    <td>
                      {r.clientName && r.client_id ? (
                        <Link
                          href={routes.admin.client(r.client_id)}
                          style={{ color: "var(--os-accent)", textDecoration: "none" }}
                        >
                          {r.clientName}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--os-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ color: "var(--os-muted)", fontSize: "10.5px" }}>
                      {detail || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {(page > 0 || hasMore) && (
        <div className="os-inline-actions" style={{ marginTop: "18px" }}>
          {page > 0 && (
            <Link className="os-btn" href={`${routes.admin.audit}?page=${page - 1}`}>
              ← Newer
            </Link>
          )}
          {hasMore && (
            <Link className="os-btn" href={`${routes.admin.audit}?page=${page + 1}`}>
              Older →
            </Link>
          )}
          <span className="os-hint">
            {AUDIT_PAGE_SIZE} per page · page {page + 1}
          </span>
        </div>
      )}
    </main>
  );
}
