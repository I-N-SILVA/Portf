/**
 * What the studio sells, in one place.
 *
 * One main offer (the MVP Sprint, in two tiers) and one small one (a landing
 * page). Everything else is an extra: listed in the request form, priced on
 * the call. Display copy lives in lib/translations/sales.ts; the plain English
 * names and descriptions here feed schema.org and llms.txt.
 *
 * Prices are GBP. Launch pricing, November 2026.
 */

export const MVP_TIERS = [
  { id: "auth", price: "£2,000", window: "2–3", includes: 5 },
  { id: "payments", price: "£4,000", window: "3–4", includes: 3 },
] as const;

export type MvpTier = (typeof MVP_TIERS)[number]["id"];

export const LANDING = { price: "£350", includes: 4 };

/** Extras a visitor can tick in the request form. Quoted on the call. */
export const EXTRAS = ["brand", "pages", "copy", "automation", "care", "deck"] as const;

export const OFFERS: { name: string; description: string }[] = [
  {
    name: "MVP Sprint",
    description:
      "A working product with sign-up and login, database, admin and deploy in 2 to 3 weeks for £2,000, or with Stripe payments in 3 to 4 weeks for £4,000.",
  },
  {
    name: "Landing page",
    description:
      "One responsive landing page built from your copy and brand in about 5 days, from £350.",
  },
];

/** Emitted as FAQPage structured data and llms.txt. */
export const INTAKE_FAQ: { question: string; answer: string }[] = [
  {
    question: "What does Ian Silva build?",
    answer:
      "MVPs for founders: a working product with login, database and admin for £2,000, or with payments for £4,000. Also landing pages from £350.",
  },
  {
    question: "How do prices work?",
    answer:
      "Fixed price for the scope agreed on the call. 50% to start, 50% on launch. Extras such as a logo, more pages or copywriting are quoted on the call.",
  },
  {
    question: "What if I don't know what I need?",
    answer: "Book the free 20-minute call. You leave knowing whether it's a fit and roughly what it costs.",
  },
];
