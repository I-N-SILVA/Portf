/**
 * Booking links. The site has one public entry point: the free 20-minute
 * fit call, a TidyCal booking type whose URL is set in Netlify as
 * NEXT_PUBLIC_TIDYCAL_FIT_CALL. It is read as a literal `process.env.X` so
 * Next inlines it at build time. Until it is set, buttons fall back to the
 * general booking URL, then to the old calendar, so none points nowhere.
 *
 * The paid kickoff links (landing page, MVP deposits) are not on the site;
 * they are sent to clients after the call.
 */
const FALLBACK =
  process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/iansilva-plyaz/30min";

export const BOOKING = {
  fitCall: process.env.NEXT_PUBLIC_TIDYCAL_FIT_CALL || FALLBACK,
} as const;

export type BookingKey = keyof typeof BOOKING;

export const CONTACT_EMAIL = "iannogueira@proton.me";
