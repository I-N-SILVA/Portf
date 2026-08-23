import { requireClientScope } from "@/lib/os/client-scope";
import { getSessionContext } from "@/lib/os/session";
import { getMyPreferences, DEFAULT_EMAIL_PREFERENCES } from "@/lib/os/preferences";
import { routes } from "@/lib/routes";
import type { ClientModules } from "@/lib/supabase/types";
import {
  ProfileForm,
  EmailPreferencesForm,
  PasswordForm,
} from "./SettingsForms";

export const metadata = { title: "Settings — Shaft OS" };

const MODULE_LABEL: Record<keyof ClientModules, string> = {
  projects: "Projects",
  billing: "Billing",
  bookings: "Bookings",
  messaging: "Messages",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scope = await requireClientScope(slug, routes.client.settings(slug));
  const client = scope.client;

  // Everything on this page writes the *signed-in user's* own record. An
  // admin looking at someone else's space is a reader here, not an editor —
  // see SettingsForms for why that's disabled rather than hidden.
  const editable = scope.access === "owner";

  const ctx = await getSessionContext();
  const preferences = editable
    ? await getMyPreferences(client.id)
    : DEFAULT_EMAIL_PREFERENCES;

  const enabledModules = (
    Object.keys(MODULE_LABEL) as (keyof ClientModules)[]
  ).filter((m) => client.modules[m]);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">{routes.client.settings(slug)}</p>
      <h1 className="os-title">Settings</h1>
      <p className="os-sub">
        Your details, what reaches your inbox, and your password.
      </p>

      <div className="os-sec">Your details</div>
      <ProfileForm
        slug={slug}
        editable={editable}
        fullName={ctx?.profile?.full_name ?? client.name}
        phone={client.phone ?? ""}
        email={editable ? (ctx?.email ?? client.email) : client.email}
      />

      <div className="os-sec">Email</div>
      <EmailPreferencesForm
        slug={slug}
        editable={editable}
        preferences={preferences}
      />

      <div className="os-sec">Password</div>
      <PasswordForm editable={editable} />

      <div className="os-sec">Your space</div>
      <div className="os-tablewrap">
        <table className="os-table">
          <tbody>
            <tr>
              <td>Your link</td>
              <td style={{ textAlign: "right", color: "var(--os-ink)" }}>
                {routes.client.root(slug)}
              </td>
            </tr>
            <tr>
              <td>On file as</td>
              <td style={{ textAlign: "right", color: "var(--os-ink)" }}>
                {client.company ?? client.name}
              </td>
            </tr>
            <tr>
              <td>Working together since</td>
              <td style={{ textAlign: "right", color: "var(--os-muted)" }}>
                {fmtDate(client.created_at)}
              </td>
            </tr>
            <tr>
              <td>What&apos;s switched on</td>
              <td style={{ textAlign: "right", color: "var(--os-muted)" }}>
                {enabledModules.length === 0
                  ? "Nothing yet"
                  : enabledModules.map((m) => MODULE_LABEL[m]).join(" · ")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="os-hint" style={{ marginTop: "14px" }}>
        Anything on this list that looks wrong is ours to fix — send a message
        and we&apos;ll sort it.
      </p>
    </main>
  );
}
