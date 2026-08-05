import { createClient } from "@/lib/supabase/server";
import type { AvailabilityWindow, Booking } from "@/lib/supabase/types";

export { WEEKDAYS, formatDateTime, formatTime } from "./booking-utils";

const isPast = (b: Booking, now: number) =>
  new Date(b.start_time).getTime() < now ||
  b.status === "declined" ||
  b.status === "cancelled" ||
  b.status === "completed";

/** All bookings for one client (see getProjectsForClient), newest first. */
export async function getBookingsForClient(clientId: string): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", clientId)
    .order("start_time", { ascending: false });
  return (data ?? []) as Booking[];
}

/** Split a client's bookings into what's still to come and what isn't. */
export function partitionBookings(
  bookings: Booking[],
  now: number = Date.now(),
): { upcoming: Booking[]; past: Booking[] } {
  return {
    upcoming: bookings
      .filter((b) => !isPast(b, now))
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    past: bookings
      .filter((b) => isPast(b, now))
      .sort((a, b) => b.start_time.localeCompare(a.start_time)),
  };
}

/** Active availability windows, ordered by weekday then start. */
export async function getAvailability(): Promise<AvailabilityWindow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("availability_windows")
    .select("*")
    .eq("active", true)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });
  return (data ?? []) as AvailabilityWindow[];
}

/** Dashboard summary: next confirmed session + pending request count. */
export function summariseBookings(
  bookings: Booking[],
  now: number = Date.now(),
) {
  const upcoming = bookings
    .filter((b) => new Date(b.start_time).getTime() >= now)
    .filter((b) => b.status === "confirmed" || b.status === "requested")
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const next = upcoming.find((b) => b.status === "confirmed") ?? upcoming[0] ?? null;
  const pending = bookings.filter((b) => b.status === "requested").length;
  return { next, pending };
}

/** The URL of an external scheduler embed, if configured (Cal.com/TidyCal/…). */
export function bookingEmbedUrl(): string | null {
  return process.env.NEXT_PUBLIC_BOOKING_URL || null;
}
