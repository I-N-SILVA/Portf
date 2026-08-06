import Link from "next/link";
import { getProjectsForClient, summarise } from "@/lib/os/projects";
import {
  getBillingForClient,
  billingSummary,
  formatMoney,
} from "@/lib/os/billing";
import {
  getBookingsForClient,
  partitionBookings,
  summariseBookings,
  formatDateTime,
} from "@/lib/os/bookings";
import { unreadForClient } from "@/lib/os/messages";
import { ActivityBeacon } from "@/components/os/ActivityBeacon";
import { routes } from "@/lib/routes";
import type { Client, ClientModules } from "@/lib/supabase/types";

/**
 * The signed-in view of /c/{slug}. Every query is scoped by the resolved
 * client id rather than the session, so an admin opening a client's space
 * sees exactly what that client sees.
 */

const MODULE_META: Record<
  keyof ClientModules,
  { label: string; href: (slug: string) => string; empty: string }
> = {
  projects: {
    label: "Projects",
    href: routes.client.projects,
    empty: "No active projects yet. New work will appear here.",
  },
  billing: {
    label: "Billing",
    href: routes.client.billing,
    empty: "No invoices or subscriptions yet.",
  },
  bookings: {
    label: "Bookings",
    href: routes.client.bookings,
    empty: "No sessions booked. Request one when you're ready.",
  },
  messaging: {
    label: "Messages",
    href: routes.client.messages,
    empty: "No messages yet. Say hello to the team.",
  },
};

export async function ClientDashboard({
  client,
  logVisit,
}: {
  client: Client;
  /** False when an admin is looking, so their visit isn't logged as the client's. */
  logVisit: boolean;
}) {
  const slug = client.slug;
  const firstName = client.name?.split(" ")[0] ?? "there";
  const modules = client.modules;
  const enabled = (Object.keys(MODULE_META) as (keyof ClientModules)[]).filter(
    (m) => modules[m],
  );

  const projectSummary = modules.projects
    ? summarise(await getProjectsForClient(client.id))
    : null;

  const billing = modules.billing ? await getBillingForClient(client.id) : null;
  const billingSum = billing ? billingSummary(billing.invoices) : null;

  const bookingSum = modules.bookings
    ? summariseBookings(
        partitionBookings(await getBookingsForClient(client.id)).upcoming,
      )
    : null;

  const unread = modules.messaging ? await unreadForClient(client.id) : 0;

  return (
    <main className="os-stage">
      {logVisit && <ActivityBeacon eventType="login" />}
      <p className="os-eyebrow">{routes.client.root(slug)}</p>
      <h1 className="os-title">
        Welcome, <em>{firstName}</em>.
      </h1>
      <p className="os-sub">
        This is your workspace. Everything we&apos;re building together — projects,
        invoices, sessions and messages — lives here. When something needs you,
        it&apos;ll be flagged.
      </p>

      <div className="os-sec">Your workspace</div>
      <div className="os-grid">
        {enabled.map((m) => {
          const meta = MODULE_META[m];
          const billingOverdue =
            m === "billing" && (billingSum?.overdueCount ?? 0) > 0;
          const messagesUnread = m === "messaging" && unread > 0;
          const flagged =
            (m === "projects" && (projectSummary?.flagged ?? 0) > 0) ||
            billingOverdue ||
            messagesUnread;
          return (
            <Link
              key={m}
              href={meta.href(slug)}
              className="os-win"
              data-flagged={flagged}
              style={{ textDecoration: "none" }}
            >
              <div className="os-win-bar">
                {meta.label}
                {m === "projects" && (projectSummary?.flagged ?? 0) > 0 && (
                  <span className="badge">{projectSummary!.flagged} to review</span>
                )}
                {billingOverdue && <span className="badge">overdue</span>}
                {messagesUnread && <span className="badge">{unread} new</span>}
                <span className="chev">→</span>
              </div>
              <div className="os-win-body">
                {m === "projects" && projectSummary && projectSummary.total > 0 ? (
                  <>
                    <div className="os-row">
                      <span className="label">Active projects</span>
                      <span className="val">{projectSummary.active}</span>
                    </div>
                    <div className="os-row">
                      <span className="label">Awaiting you</span>
                      <span
                        className={`val ${projectSummary.flagged > 0 ? "accent" : ""}`}
                      >
                        {projectSummary.flagged}
                      </span>
                    </div>
                    <p className="os-empty" style={{ marginTop: "auto" }}>
                      {projectSummary.total} project
                      {projectSummary.total === 1 ? "" : "s"} in total.
                    </p>
                  </>
                ) : m === "bookings" && bookingSum ? (
                  <>
                    <div className="os-row">
                      <span className="label">Next session</span>
                      <span className="val gold">
                        {bookingSum.next
                          ? formatDateTime(bookingSum.next.start_time)
                          : "None"}
                      </span>
                    </div>
                    <div className="os-row">
                      <span className="label">Awaiting confirmation</span>
                      <span className="val">{bookingSum.pending}</span>
                    </div>
                    <p className="os-empty" style={{ marginTop: "auto" }}>
                      Request a session anytime.
                    </p>
                  </>
                ) : m === "billing" && billing ? (
                  <>
                    <div className="os-row">
                      <span className="label">Plan</span>
                      <span className="val gold">
                        {billing.subscription?.plan ??
                          (billing.subscription ? "Subscription" : "Per project")}
                      </span>
                    </div>
                    <div className="os-row">
                      <span className="label">Overdue</span>
                      <span
                        className={`val ${billingSum!.overdueCount > 0 ? "accent" : ""}`}
                      >
                        {billingSum!.overdueCount > 0
                          ? formatMoney(billingSum!.overdueAmount, billingSum!.currency)
                          : "None"}
                      </span>
                    </div>
                    <p className="os-empty" style={{ marginTop: "auto" }}>
                      {billing.invoices.length} invoice
                      {billing.invoices.length === 1 ? "" : "s"} on record.
                    </p>
                  </>
                ) : m === "messaging" ? (
                  <>
                    <div className="os-row">
                      <span className="label">Unread</span>
                      <span className={`val ${unread > 0 ? "accent" : ""}`}>
                        {unread > 0 ? unread : "None"}
                      </span>
                    </div>
                    <p className="os-empty" style={{ marginTop: "auto" }}>
                      A direct line to the team.
                    </p>
                  </>
                ) : (
                  <p className="os-empty">{meta.empty}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
