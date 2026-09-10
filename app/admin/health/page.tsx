import { gatherHealth } from "@/lib/os/health";
import { supabaseConfigured } from "@/lib/env";
import { NotConfigured } from "@/components/os/NotConfigured";
import type { Finding } from "@/lib/os/doctor-utils";

export const metadata = { title: "Health — Shaft OS Admin" };
export const dynamic = "force-dynamic";

/**
 * What `npm run doctor` reports, from inside the running deploy.
 *
 * The script needs the environment on your machine; this reads the one that
 * is actually serving the site — which is the one that tends to be wrong.
 * Admin-only, and it renders which variables are *set*, never their values.
 */
function Row({ finding }: { finding: Finding }) {
  const tone =
    finding.severity === "fail"
      ? "os-health-fail"
      : finding.severity === "warn"
        ? "os-health-warn"
        : "os-health-ok";
  const label =
    finding.severity === "fail" ? "FAIL" : finding.severity === "warn" ? "WARN" : "OK";

  return (
    <li className="os-health-row">
      <span className={`os-health-badge ${tone}`}>{label}</span>
      <span className="os-health-body">
        <span className="os-health-message">{finding.message}</span>
        {finding.detail && (
          <span className="os-health-detail">{finding.detail}</span>
        )}
      </span>
    </li>
  );
}

export default async function HealthPage() {
  if (!supabaseConfigured()) return <NotConfigured area="/admin/health" />;

  const report = await gatherHealth();
  const missingEnv = report.env.filter((e) => !e.set);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · health</p>
      <h1 className="os-title">Health</h1>
      <p className="os-sub">
        The same checks <code>npm run doctor</code> runs, against the
        environment actually serving this page. A client space is visible only
        when every link below holds; when one doesn&apos;t, a visitor gets a
        blank 404 that can&apos;t tell you which.
      </p>

      <div className="os-sec">Configuration</div>
      {missingEnv.length === 0 ? (
        <ul className="os-health">
          <Row
            finding={{
              severity: "ok",
              message: `all ${report.env.length} production variables set`,
            }}
          />
        </ul>
      ) : (
        <ul className="os-health">
          {missingEnv.map((e) => (
            <Row
              key={e.name}
              finding={{
                severity: e.name.startsWith("NEXT_PUBLIC_SUPABASE") ? "fail" : "warn",
                message: `${e.name} is unset`,
                detail: e.consequence,
              }}
            />
          ))}
        </ul>
      )}

      <div className="os-sec">Schema</div>
      <ul className="os-health">
        {report.missingTables.length === 0 ? (
          <Row finding={{ severity: "ok", message: "all 18 tables present" }} />
        ) : (
          <Row
            finding={{
              severity: "fail",
              message: `${report.missingTables.length} table(s) unreachable: ${report.missingTables.join(", ")}`,
              detail:
                report.schemaError ??
                "Apply supabase/apply-0001-0017.sql in the Supabase SQL editor.",
            }}
          />
        )}
      </ul>

      {report.missingTables.length === 0 && (
        <>
          <div className="os-sec">People &amp; clients</div>
          <ul className="os-health">
            {report.install.map((f, i) => (
              <Row key={i} finding={f} />
            ))}
          </ul>

          {report.spaces.length > 0 && (
            <>
              <div className="os-sec">Client spaces</div>
              <ul className="os-health">
                {report.spaces.map((f, i) => (
                  <Row key={i} finding={f} />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {!report.serviceKey && (
        <p className="os-hint" style={{ marginTop: "22px" }}>
          <code>SUPABASE_SERVICE_ROLE_KEY</code> is unset, so these counts are
          what row-level security lets your own session see — they may read low.
          Client invites and both webhooks also need it.
        </p>
      )}
    </main>
  );
}
