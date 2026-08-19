import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

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
  cached = new Stripe(
    requireEnv("STRIPE_SECRET_KEY", "Billing and the customer portal need it."),
  );
  return cached;
}
