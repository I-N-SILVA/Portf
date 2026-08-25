import { createClient } from "@/lib/supabase/server";
import type { ContactSubmission } from "@/lib/supabase/types";
import { MarkHandledButton } from "./EnquiryActions";

export const metadata = { title: "Enquiries — Shaft OS Admin" };

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Everything sent through the studio contact form.
 *
 * These used to exist only in a Netlify dashboard outside the app, which meant
 * the record of who had asked for what wasn't anywhere you'd actually look —
 * and if the post to Netlify failed, wasn't anywhere at all.
 */
export default async function EnquiriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const enquiries = (data ?? []) as ContactSubmission[];
  const open = enquiries.filter((e) => !e.handled_at);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · enquiries</p>
      <h1 className="os-title">Enquiries</h1>
      <p className="os-sub">
        {open.length === 0
          ? "Nothing waiting on you."
          : `${open.length} waiting on a reply.`}{" "}
        Everything sent through the studio contact form lands here, whether or
        not the notification email went out.
      </p>

      {enquiries.length === 0 ? (
        <p className="os-empty">
          No enquiries yet. They&apos;ll appear here the moment someone uses the
          form at /studio.
        </p>
      ) : (
        <div className="os-tablewrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>From</th>
                <th>Wants</th>
                <th>Message</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} style={{ opacity: e.handled_at ? 0.5 : 1 }}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmt(e.created_at)}</td>
                  <td>
                    <strong>{e.name}</strong>
                    <br />
                    <a href={`mailto:${e.email}`}>{e.email}</a>
                    {e.company && (
                      <>
                        <br />
                        <span className="os-dim">{e.company}</span>
                      </>
                    )}
                  </td>
                  <td>{e.project_type ?? "—"}</td>
                  <td style={{ maxWidth: "36ch" }}>{e.message}</td>
                  <td>{e.ref ?? "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {e.handled_at ? (
                      <span className="os-dim">Handled</span>
                    ) : (
                      <MarkHandledButton id={e.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
