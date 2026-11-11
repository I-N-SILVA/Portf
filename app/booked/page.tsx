import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "You're booked — Ian N. Silva",
  robots: { index: false, follow: false },
};

/** Where TidyCal sends people after they book (set per booking type in TidyCal → More → After booking). */
export default function Booked() {
  return (
    <main className="shaft-fallback">
      <p className="shaft-fallback-eyebrow">Booking confirmed</p>
      <h1 className="shaft-fallback-title">You&apos;re booked.</h1>
      <p className="shaft-fallback-body">
        The calendar invite and the Google Meet link are on their way to your
        inbox. Before we talk, have a link or a few lines about what you&apos;re
        building to hand. That&apos;s all the prep there is.
      </p>
      <div className="shaft-fallback-actions">
        <Link className="shaft-fallback-link" href={routes.home}>
          Back to the site
        </Link>
      </div>
    </main>
  );
}
