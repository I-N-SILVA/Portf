/**
 * The two service pages (/mvp-development, /landing-page-design), as data.
 *
 * These exist for search and answer engines: the landing page sells the
 * offer in one scroll, but "MVP developer UK" and "landing page designer UK"
 * need a page each that answers the buyer's questions in plain text. Every
 * fact here matches lib/offers.ts and the offer copy on the landing page;
 * change them together.
 *
 * The page renders visible FAQ, and the same items are emitted as FAQPage
 * schema, so what a model quotes is what a person reads.
 */
import { LANDING, MVP_TIERS } from "@/lib/offers";

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  /** <title>, under 60 characters. */
  title: string;
  /** Meta description, around 155 characters. */
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  tiers: { name: string; price: string; priceValue: number; timeline: string; includes: string[] }[];
  /** Short answers placed high on the page, which answer engines lift whole. */
  answers: Faq[];
  steps: { title: string; body: string }[];
  fit: string[];
  proof: { name: string; note: string; href: string }[];
  faq: Faq[];
  serviceType: string;
};

const mvpAuth = MVP_TIERS[0];
const mvpPay = MVP_TIERS[1];
const num = (p: string) => Number(p.replace(/[^0-9]/g, ""));

export const SERVICES: Record<"mvp" | "landing", Service> = {
  mvp: {
    slug: "/mvp-development",
    title: "Fixed-Price MVP Development, UK | Ian N. Silva",
    description: `A working MVP with login, database and admin in ${mvpAuth.window} weeks for ${mvpAuth.price}, or with Stripe payments for ${mvpPay.price}. Fixed price, UK-based, you own the code.`,
    eyebrow: "MVP development · UK",
    h1: "Fixed-price MVP development for founders",
    lead: "A working product, not a prototype. Real sign-up, real data, deployed at your URL and ready for your first users. One fixed price agreed before anything starts.",
    tiers: [
      {
        name: "MVP Sprint, with login",
        price: mvpAuth.price,
        priceValue: num(mvpAuth.price),
        timeline: `${mvpAuth.window} weeks`,
        includes: [
          "Up to 3 core features",
          "Sign-up and login (email or Google)",
          "Database and admin view",
          "Deployed on your domain",
          "Analytics and a handover video",
        ],
      },
      {
        name: "MVP Sprint, with payments",
        price: mvpPay.price,
        priceValue: num(mvpPay.price),
        timeline: `${mvpPay.window} weeks`,
        includes: [
          "Everything in the login tier",
          "Stripe payments or subscriptions",
          "Billing portal for your customers",
          "Receipts and transactional emails",
        ],
      },
    ],
    answers: [
      { q: "How much does an MVP cost?", a: `${mvpAuth.price} for a working product with login, database and admin, or ${mvpPay.price} with Stripe payments. Fixed price, 50% to start and 50% on launch.` },
      { q: "How long does it take?", a: `${mvpAuth.window} weeks with login, ${mvpPay.window} weeks with payments, from the day the scope is agreed.` },
      { q: "Who owns the code?", a: "You do, from day one. It lives in your repository and deploys to your domain." },
    ],
    steps: [
      { title: "Free 20-minute call", body: "You explain the idea and who it is for. You leave knowing whether it fits a Sprint and roughly what it costs." },
      { title: "Scope and fixed price", body: "We agree the three core features and the price in writing. 50% starts the work." },
      { title: "Build", body: "I build in short loops and share a live link as it takes shape, so nothing lands as a surprise at the end." },
      { title: "Launch and handover", body: "Deployed on your domain with analytics, plus a handover video. The second 50% is due at launch." },
    ],
    fit: [
      "Founders who need a real product in front of users or investors, not another mock-up",
      "Small teams replacing a spreadsheet or manual process with a proper tool",
      "Anyone who wants a fixed price instead of an open-ended day rate",
    ],
    proof: [
      { name: "QLICO", note: "Live product: interactive PDF editions with analytics and Stripe billing", href: "https://folio-liard-nu.vercel.app" },
      { name: "SNAQR", note: "Co-founded: QR menus restaurants edit live", href: "https://snaqr.tech" },
      { name: "StockSnap", note: "Case study: mobile stocktaking across sites", href: "/studio/work/stocksnap-field-inventory" },
    ],
    faq: [
      { q: "What is the difference between a prototype and an MVP?", a: "A prototype shows the idea. An MVP is used: people sign up, their data is saved, and it runs on your domain. The Sprint delivers the second." },
      { q: "What if I need more than three features?", a: "Extra features are scoped and priced on the call, before anything starts. You always know the full price up front." },
      { q: "What do you build with?", a: "Modern, mainstream tools: Next.js and React on the front, Postgres through Supabase for data and login, Stripe for payments. Nothing exotic, so any developer can pick it up after." },
      { q: "Do you work with founders outside London?", a: "Yes. I'm UK-based and work remotely with founders across the UK, London included, and further afield. Prices are in GBP." },
      { q: "What happens after launch?", a: "You get the code, the deploy and a handover video. Ongoing changes and care can be quoted separately if you want them." },
    ],
    serviceType: "MVP development",
  },
  landing: {
    slug: "/landing-page-design",
    title: `Landing Page Design from ${LANDING.price}, UK | Ian N. Silva`,
    description: `One fast, mobile-first landing page built from your copy and brand, live on your domain in about 5 days. From ${LANDING.price}, fixed price, UK-based.`,
    eyebrow: "Landing pages · UK",
    h1: `Landing page design and build, from ${LANDING.price}`,
    lead: "One responsive page built from your copy and brand, live on your own domain in about 5 days. Fast on phones, set up to be found, with a clear way for visitors to get in touch.",
    tiers: [
      {
        name: "Landing page",
        price: LANDING.price,
        priceValue: num(LANDING.price),
        timeline: "about 5 days",
        includes: ["Up to 5 sections", "Mobile-first, fast, SEO basics", "Contact form or booking link", "Analytics set up"],
      },
    ],
    answers: [
      { q: "How much does a landing page cost?", a: `From ${LANDING.price} for one page with up to 5 sections. More pages, copywriting and design extras are quoted on the call.` },
      { q: "How long does it take?", a: "About 5 days from receiving your copy and brand assets." },
      { q: "What do I need to provide?", a: "Your copy, logo and any images. If you don't have copy yet, writing it can be added and quoted on the call." },
    ],
    steps: [
      { title: "Free 20-minute call", body: "What the page is for, who it is for and what visitors should do next." },
      { title: "Pay and send assets", body: "Landing pages are paid upfront. You send copy, logo and images." },
      { title: "Build", body: "Mobile first, fast, with SEO basics and analytics wired in." },
      { title: "Live on your domain", body: "In about 5 days, with your contact form or booking link working." },
    ],
    fit: [
      "Small businesses whose current site is slow, broken on phones or hard to book from",
      "Founders who need a page to test an idea or collect sign-ups",
      "Anyone launching a product, event or offer that needs one clear page",
    ],
    proof: [
      { name: "Heart Priestess", note: "Client landing page: offerings, a card-draw deck, gallery and booking", href: "https://heart-priestess.vercel.app/ritual.html" },
      { name: "NOTCHY", note: "Product site for an open-source macOS app", href: "https://notchylimit.com" },
      { name: "iamnsilva.me", note: "This site: one offer, one booking flow", href: "/" },
    ],
    faq: [
      { q: "Will my landing page work well on phones?", a: "Yes. It is built mobile first, then checked on desktop, because most small-business visitors arrive on a phone." },
      { q: "Will it show up on Google?", a: "It ships with the SEO basics: a proper title and description, clean headings, fast loading and a sitemap. Ranking also depends on your content and links, which we can talk through on the call." },
      { q: "Can visitors book or contact me from it?", a: "Yes. Every page includes a contact form or a booking link, placed where people actually look for it." },
      { q: "Can I add more pages later?", a: "Yes. Extra pages are quoted on the call, before anything starts." },
    ],
    serviceType: "Landing page design",
  },
};
