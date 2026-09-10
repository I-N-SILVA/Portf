/**
 * The three things the studio sells, in one place.
 *
 * The display copy lives in lib/translations/* because it is translated five
 * ways. What lives here is the language-neutral spine: the id each offer is
 * routed to by the intake terminal, and a plain English name and description
 * for the machines — schema.org, llms.txt, anything that summarises the site
 * without rendering it.
 *
 * Those two audiences want different sentences. A visitor reading the drawer
 * gets "a thing they can click"; a model asked what this person does needs
 * "a working, deployed prototype". Keeping both here stops the schema from
 * drifting away from the offering, which is exactly what had happened — it
 * still advertised Web3 and machine learning.
 */
export interface Offer {
  /** Matches the numeral printed on the slip. */
  num: "01" | "02" | "03";
  /** Plain English, for structured data. */
  name: string;
  /** Plain English, one sentence, for structured data and llms.txt. */
  description: string;
  /** The intake answer that routes here. */
  intake: "a" | "b" | "c";
}

export const OFFERS: Offer[] = [
  {
    num: "01",
    name: "Prototype & MVP build",
    description:
      "A working, deployed prototype built in days so an idea can be put in front of real users, investors or a team before committing to a full build.",
    intake: "b",
  },
  {
    num: "02",
    name: "Conversion-focused landing pages",
    description:
      "Copy, layout, build and analytics delivered as one job, so a launch, waitlist or paid campaign lands on a page that makes the argument and reports whether it worked.",
    intake: "c",
  },
  {
    num: "03",
    name: "AI automation of repeated work",
    description:
      "Existing tools — email, CRM, Notion, Airtable, Stripe — wired together with AI handling the reading, sorting and drafting in between, so a weekly manual task stops needing a person.",
    intake: "a",
  },
];

/** Intake answer → offer, or null for "I don't know yet". */
export const INTAKE_ROUTES: Record<string, Offer["num"] | null> = {
  ...Object.fromEntries(OFFERS.map((offer) => [offer.intake, offer.num])),
  d: null,
};

/**
 * The intake questions, as question-and-answer pairs.
 *
 * The terminal already asks these out loud and answers them by routing. In
 * that shape they are also the only FAQ the site has, so they are emitted as
 * FAQPage structured data from the same source rather than written twice —
 * question-shaped content is what answer engines lift, and this site had
 * none since the studio's FAQ left with it.
 */
export const INTAKE_FAQ: { question: string; answer: string }[] = [
  {
    question:
      "I have a process my team repeats every week — what can Ian Silva build?",
    answer: OFFERS[2].description,
  },
  {
    question: "I have an idea nobody can try yet — what can Ian Silva build?",
    answer: OFFERS[0].description,
  },
  {
    question:
      "My site gets traffic that arrives and leaves — what can Ian Silva build?",
    answer: OFFERS[1].description,
  },
  {
    question: "What if I don't know which of these I need?",
    answer:
      "Bring the problem as it actually is. The first call is free and diagnostic: if a smaller piece would settle the question faster, that is what gets built first, and if it is not work for this studio you get told so.",
  },
];
