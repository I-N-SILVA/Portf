import Stripe from "stripe";

/**
 * Server-only Stripe client. Requires STRIPE_SECRET_KEY. Never import this
 * into anything that runs in the browser.
 *
 * apiVersion is intentionally omitted so the account's default pinned version
 * is used — avoids a hard-coded literal drifting out of sync with the SDK.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  cached = new Stripe(key);
  return cached;
}
