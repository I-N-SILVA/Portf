import {
  getAvailability,
  getClientBookings,
  bookingEmbedUrl,
  formatDateTime,
  formatTime,
  WEEKDAYS,
} from "@/lib/os/bookings";
import type { Booking } from "@/lib/supabase/types";
import { RequestBookingForm, BookingActions } from "./BookingClient";

export const metadata = { title: "Bookings — Shaft OS" };

const STATUS_TONE: Record<string, "gold" | "dim" | "accent"> = {
  requested: "gold",
  confirmed: "gold",
  completed: "dim",
  declined: "accent",
  cancelled: "dim",
};

function durationMin(b: Booking): number {
  return Math.max(
    15,
    Math.round(
      (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 60000,
    ),
  );
}

export default async function BookingsPage() {
  const [{ upcoming, past }, availability] = await Promise.all([
    getClientBookings(),
    getAvailability(),
  ]);
  const embed = bookingEmbedUrl();

  return (
    <main className="os-stage">
      <p className="os-eyebrow">portal · bookings</p>
      <h1 className="os-title">Bookings</h1>
      <p className="os-sub">
        Request a session and we&apos;ll confirm it. You can reschedule or cancel
        anything that hasn&apos;t happened yet.
      </p>

      {availability.length > 0 && (
        <p className="os-sub" style={{ marginTop: "-24px" }}>
          <span style={{ color: "var(--os-muted)" }}>Typical availability: </span>
          {availability
            .map((w) => `${WEEKDAYS[w.weekday].slice(0, 3)} ${formatTime(w.start_time)}–${formatTime(w.end_time)}`)
            .join(" · ")}
        </p>
      )}

      <div className="os-sec">Request a session</div>
      {embed ? (
        <div className="os-tablewrap" style={{ overflow: "hidden", marginBottom: "36px" }}>
          <iframe
            src={embed}
            title="Book a session"
            style={{ width: "100%", height: "620px", border: "none", display: "block" }}
          />
        </div>
      ) : (
        <RequestBookingForm />
      )}

      <div className="os-sec">Upcoming</div>
      {upcoming.length === 0 ? (
        <p className="os-empty" style={{ marginBottom: "28px" }}>
          Nothing scheduled yet.
        </p>
      ) : (
        <ol className="os-timeline" style={{ marginBottom: "36px" }}>
          {upcoming.map((b) => (
            <li key={b.id} className="os-ms" data-flagged={b.status === "requested"}>
              <div className="os-ms-head">
                <span className="os-ms-name">{b.service_type}</span>
                <span className={`os-note ${STATUS_TONE[b.status] ?? "dim"}`} style={{ fontSize: "10.5px" }}>
                  {b.status === "requested" ? "Awaiting confirmation" : b.status}
                </span>
              </div>
              <div className="os-ms-meta">
                <span>{formatDateTime(b.start_time)}</span>
                <span>{durationMin(b)} min</span>
              </div>
              {b.notes && <p className="os-ms-desc">{b.notes}</p>}
              <BookingActions bookingId={b.id} durationMin={durationMin(b)} />
            </li>
          ))}
        </ol>
      )}

      <div className="os-sec">Past</div>
      {past.length === 0 ? (
        <p className="os-empty">No past sessions.</p>
      ) : (
        <ol className="os-timeline">
          {past.map((b) => (
            <li key={b.id} className="os-ms">
              <div className="os-ms-head">
                <span className="os-ms-name">{b.service_type}</span>
                <span className={`os-note ${STATUS_TONE[b.status] ?? "dim"}`} style={{ fontSize: "10.5px" }}>
                  {b.status}
                </span>
              </div>
              <div className="os-ms-meta">
                <span>{formatDateTime(b.start_time)}</span>
                {b.decline_reason && <span>“{b.decline_reason}”</span>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
