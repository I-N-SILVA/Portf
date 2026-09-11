"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";
import { IntakeTerminal } from "@/components/ui/intake-terminal";
import ShaftEnquiryForm from "./ShaftEnquiryForm";
import { INTAKE_ROUTES } from "@/lib/offers";
import { routes } from "@/lib/routes";
import { useSoundEffects } from "@/hooks/useSoundEffects";

/** Where the studio can be reached once the triage has named a problem. */
const EMAIL = "iannogueira@proton.me";

/**
 * Which capability each answer resolves to. `null` is the "it's messy"
 * answer, which resolves to all of them — that is a real outcome, not a
 * failure to choose, and it is the one the closing line already speaks to.
 */
const ROUTES = INTAKE_ROUTES;

export default function ShaftOffers() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();
  const [answer, setAnswer] = useState<string | null>(null);
  /** The second question. Only asked once the first has been answered. */
  const [when, setWhen] = useState<string | null>(null);
  /**
   * The third. Asked last and deliberately not printed on the slips: a number
   * on the card is the thing people leave over, but a number they choose is
   * the thing that makes a reply useful. Everyone who reaches this has already
   * described a problem and a deadline, so the question costs the least here
   * and is worth the most — an enquiry with a band attached can be answered
   * with a yes or a no instead of another email asking for one.
   */
  const [budget, setBudget] = useState<string | null>(null);

  /**
   * The terminal only exists once the JavaScript that drives it does.
   * Rendering it server-side would ship a menu whose buttons do nothing to
   * anyone whose bundle fails, and the three slips below are the real
   * content — they render either way, in full, unfiltered.
   */
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  /*
    Each slip carries one more line than it used to: evidence.

    "Best when" tells a visitor whether the problem is theirs. It does not
    tell them this has ever worked, and a claim about a two-week build is
    exactly the kind that wants a receipt. Where a shipped project genuinely
    demonstrates the offer, the slip links to it. Where none does — nothing in
    the archive is a landing-page job — the slot carries the deliverables
    instead, so the row still balances and nothing is invented to fill it.
  */
  const offers = [
    {
      num: "01",
      title: t("offers.1.title"),
      body1: t("offers.1.body1"),
      body2: t("offers.1.body2"),
      window: t("offers.1.window"),
      proof: {
        label: t("offers.1.proof"),
        href: routes.studio.work("stocksnap-field-inventory"),
      },
    },
    {
      num: "02",
      title: t("offers.2.title"),
      body1: t("offers.2.body1"),
      body2: t("offers.2.body2"),
      window: t("offers.2.window"),
      proof: { label: t("offers.2.proof"), href: null },
    },
    {
      num: "03",
      title: t("offers.3.title"),
      body1: t("offers.3.body1"),
      body2: t("offers.3.body2"),
      window: t("offers.3.window"),
      proof: {
        label: t("offers.3.proof"),
        href: routes.studio.work("multi-platform-content-engine"),
      },
    },
  ];

  const routed = answer ? ROUTES[answer] : undefined;

  /**
   * The mail already says what it is about, in the reader's own words: the
   * offer, the problem they picked, and — once they have answered the
   * follow-up — when they want it.
   */
  /**
   * The answers as labelled lines rather than one run-on sentence. The form
   * prints them as a manifest, and what lands in /admin keeps the same shape
   * — a record that can be read at a glance instead of a string that has to
   * be decoded back into fields.
   */
  const intakeManifest = (offerTitle?: string) => {
    // No JOB line on the "I don't know yet" path: there is no offer there, and
    // filling the slot with the problem again printed the same sentence twice.
    const lines = offerTitle
      ? [{ label: t("enquiry.field.offer"), value: offerTitle }]
      : [];
    if (answer) lines.push({ label: t("enquiry.field.problem"), value: t(`intake.${answer}`) });
    if (when) lines.push({ label: t("enquiry.field.when"), value: t(`intake.q2.${when}`) });
    if (budget) lines.push({ label: t("enquiry.field.budget"), value: t(`intake.q3.${budget}`) });
    return lines;
  };
  /**
   * True once the drawer is narrowed to one slip *and* there is nothing left
   * to ask. The form used to appear after the first answer, which put it
   * above two unanswered questions and meant most enquiries arrived carrying
   * only a category.
   */
  const narrowed = answer !== null && routed !== null && budget !== null;

  return (
    <section
      ref={sectionRef}
      id="shaft-offers"
      className="relative py-28 overflow-hidden"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      {/* Watermark — parallax + Glitch */}
      <motion.div
        aria-hidden="true"
        className="absolute right-0 top-20 font-playfair font-black leading-none pointer-events-none select-none shaft-glitch"
        style={{
          fontSize: "clamp(120px, 22vw, 320px)",
          // Was a hardcoded rgb(8 8 8): correct against the dark ground and a
          // solid black slab on the parchment theme. --shaft-surface is the
          // one-step-off-the-background token, so it stays a watermark in
          // both.
          color: "rgb(var(--shaft-surface))",
          lineHeight: 1,
          y: watermarkY,
        }}
      >
        03
      </motion.div>

      <div className="px-8 md:px-16 lg:px-24 relative z-10">
        {/* Section intertitle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-4 mb-14"
        >
          <div
            className="h-px w-10 shrink-0"
            style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
          />
          <span
            className="font-space-mono text-[8px] tracking-[0.55em] uppercase"
            style={{ color: "rgb(var(--shaft-gold))" }}
          >
            {t("offers.section")}
          </span>
          <motion.div
            className="h-px flex-1 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ backgroundColor: "rgb(var(--shaft-border))" }}
          />
        </motion.div>

        {/* Header Block */}
        <div className="mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-playfair font-black leading-[0.9] tracking-tight mb-8"
            style={{
              color: "rgb(var(--shaft-cream))",
              fontSize: "clamp(48px, 6vw, 84px)",
              maxWidth: "800px",
            }}
          >
            {t("offers.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-space-mono text-[10px] md:text-[12px] tracking-[0.2em] uppercase"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            {t("offers.subtitle")}
          </motion.p>
        </div>

        {live && (
          <IntakeTerminal
            className="mb-16 md:mb-20 [&_[data-part=answer]]:text-[rgb(var(--shaft-cream-dim))] [&_[data-part=arrow]]:text-[rgb(var(--shaft-crimson-text))] [&_[data-part=hint]]:text-[rgb(var(--shaft-muted))] [&_[data-part=prompt]]:text-[rgb(var(--shaft-cream))] [&_[data-part=reset]]:text-[rgb(var(--shaft-muted))]"
            prompt={t("intake.prompt")}
            hint={t("intake.hint")}
            resetLabel={when ? undefined : t("intake.reset")}
            value={answer}
            collapseOnAnswer
            onChange={(next) => {
              setAnswer(next);
              // A different problem deserves the timing question again.
              setWhen(null);
              if (next) playSound("click");
            }}
            options={[
              { value: "a", label: t("intake.a") },
              { value: "b", label: t("intake.b") },
              { value: "c", label: t("intake.c") },
              { value: "d", label: t("intake.d") },
            ]}
            optionClassName="text-[rgb(var(--shaft-cream-dim))] hover:text-[rgb(var(--shaft-cream))] data-[active=true]:text-[rgb(var(--shaft-cream))] [&_[data-tab]]:bg-[rgb(var(--shaft-crimson))] [&>span:nth-child(2)]:text-[rgb(var(--shaft-crimson-text))]"
          />
        )}

        {/*
          The follow-up. A terminal accumulates: the first question settles
          into a transcript line and this one appears beneath it, so two
          clicks describe a problem and a timeline rather than one click
          describing a category. Both answers ride the mailto subject, which
          is the difference between an enquiry and a qualified one.
        */}
        {live && answer && (
          <IntakeTerminal
            className="-mt-6 mb-16 md:mb-20 [&_[data-part=hint]]:text-[rgb(var(--shaft-muted))] [&_[data-part=prompt]]:text-[rgb(var(--shaft-cream))] [&_[data-part=reset]]:text-[rgb(var(--shaft-muted))] [&_[data-part=answer]]:text-[rgb(var(--shaft-cream-dim))] [&_[data-part=arrow]]:text-[rgb(var(--shaft-crimson-text))]"
            prompt={t("intake.q2")}
            resetLabel={t("intake.reset")}
            typewriter={false}
            collapseOnAnswer
            value={when}
            onChange={(next) => {
              setWhen(next);
              if (next) playSound("click");
            }}
            options={[
              { value: "a", label: t("intake.q2.a") },
              { value: "b", label: t("intake.q2.b") },
              { value: "c", label: t("intake.q2.c") },
            ]}
            optionClassName="text-[rgb(var(--shaft-cream-dim))] hover:text-[rgb(var(--shaft-cream))] data-[active=true]:text-[rgb(var(--shaft-cream))] [&_[data-tab]]:bg-[rgb(var(--shaft-crimson))] [&>span:nth-child(2)]:text-[rgb(var(--shaft-crimson-text))]"
          />
        )}

        {/*
          The budget band, asked last.

          Deliberately not printed on the slips. A number on a card is the
          thing people leave over — they read it, decide they are the wrong
          size of client, and close the tab without ever describing what they
          wanted. A number they pick is the opposite: by here they have named
          a problem and a deadline, so answering costs almost nothing, and the
          enquiry arrives answerable with a yes or a no rather than another
          email asking for one.

          The last option is not "prefer not to say". It is an invitation to
          the conversation, because the person who has no idea what this
          should cost is the one most worth talking to and the one a band
          would otherwise turn away.
        */}
        {live && answer && when && (
          <IntakeTerminal
            className="-mt-6 mb-16 md:mb-20 [&_[data-part=hint]]:text-[rgb(var(--shaft-muted))] [&_[data-part=prompt]]:text-[rgb(var(--shaft-cream))] [&_[data-part=reset]]:text-[rgb(var(--shaft-muted))] [&_[data-part=answer]]:text-[rgb(var(--shaft-cream-dim))] [&_[data-part=arrow]]:text-[rgb(var(--shaft-crimson-text))]"
            prompt={t("intake.q3")}
            resetLabel={t("intake.reset")}
            typewriter={false}
            collapseOnAnswer
            value={budget}
            onChange={(next) => {
              setBudget(next);
              if (next) playSound("click");
            }}
            options={[
              { value: "a", label: t("intake.q3.a") },
              { value: "b", label: t("intake.q3.b") },
              { value: "c", label: t("intake.q3.c") },
              { value: "d", label: t("intake.q3.d") },
            ]}
            optionClassName="text-[rgb(var(--shaft-cream-dim))] hover:text-[rgb(var(--shaft-cream))] data-[active=true]:text-[rgb(var(--shaft-cream))] [&_[data-tab]]:bg-[rgb(var(--shaft-crimson))] [&>span:nth-child(2)]:text-[rgb(var(--shaft-crimson-text))]"
          />
        )}

        {/*
          A drawer of catalogue slips rather than three stacked essays.

          The old form was one full-width prose block per offer, which meant
          the three could only be compared by scrolling between them — and
          they exist to be compared. Side by side with the same four parts in
          the same order (index, title, what it is, who it is for), the
          comparison is the layout. The punch at the foot of each slip is the
          detail that makes it a card and not a box.
        */}
        {/*
          `items-start` once a slip is chosen, so the drawer opens one and
          leaves the other two at their natural height. A stretched grid makes
          every card as tall as the tallest, and the chosen one now carries a
          form — which left the two beside it as several hundred pixels of
          empty ruled surface. Before the choice the three are still stretched,
          because that is what makes them comparable.
        */}
        <div
          className={`grid gap-px md:grid-cols-3 ${narrowed ? "items-start" : ""}`}
        >
          {offers.map((offer, i) => (
            <motion.article
              key={offer.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
              /*
                The rules are drawn per slip, not by showing a coloured grid
                background through 1px gaps. That trick needs every cell to be
                the same height, and once a chosen slip opens while the others
                stay short it paints the whole area under them as a solid slab
                of border colour. A 1px outline on each card meets its
                neighbour's across the gap and draws the same line without
                depending on the row being full.
              */
              className="group relative flex flex-col p-8 shadow-[0_0_0_1px_rgb(var(--shaft-border))] transition-colors duration-500 lg:p-10"
              data-picked={narrowed ? routed === offer.num : undefined}
              style={{
                /*
                  Recession by surface, never by opacity. Dimming the text of
                  the slips you did not pick would drop them under AA, and
                  they are still meant to be readable — the brief was that
                  they recede, not that they go away. Losing the fill lets
                  them sink into the section while every word keeps its
                  contrast.
                */
                backgroundColor:
                  narrowed && routed !== offer.num
                    ? "rgb(var(--shaft-bg))"
                    : "rgb(var(--shaft-surface))",
              }}
            >
              {/* Filing rule — drawn on hover, and held open once picked. */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-0.5 w-0 transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full group-data-[picked=true]:w-full"
                style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
              />

              <div className="flex items-baseline gap-4">
                <span
                  className="font-space-mono text-[10px] tracking-[0.3em]"
                  style={{ color: "rgb(var(--shaft-crimson-text))" }}
                >
                  [ {offer.num} ]
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1"
                  style={{ backgroundColor: "rgb(var(--shaft-border))" }}
                />
                {/*
                  The headline promises two to four weeks and then nothing on
                  the page stood behind it. Each slip now says where in that
                  window it lands.
                */}
                <span
                  className="shrink-0 font-space-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: "rgb(var(--shaft-muted))" }}
                >
                  {offer.window}
                </span>
              </div>

              <h3
                className="mt-6 font-playfair font-black leading-[1.06]"
                style={{
                  fontSize: "clamp(22px, 2vw, 30px)",
                  color: "rgb(var(--shaft-cream))",
                }}
              >
                {offer.title}
              </h3>

              <p
                className="mt-5 text-[15px] leading-relaxed"
                style={{ color: "rgb(var(--shaft-cream-dim))" }}
              >
                {offer.body1}
              </p>

              <div className="mt-auto pt-8">
                <span
                  className="font-space-mono text-[9px] uppercase tracking-[0.28em]"
                  style={{ color: "rgb(var(--shaft-gold))" }}
                >
                  {t("offers.bestWhen")}
                </span>
                <p
                  className="mt-2 text-[12px] leading-relaxed"
                  style={{ color: "rgb(var(--shaft-muted))" }}
                >
                  {offer.body2}
                </p>

                {/*
                  The receipt. A link where a shipped project genuinely
                  demonstrates the offer; a plain line where none does, so the
                  three slips keep the same shape and nothing is invented to
                  fill the gap.
                */}
                <p className="mt-5 text-[11px] leading-relaxed">
                  <span
                    className="font-space-mono uppercase tracking-[0.22em]"
                    style={{ color: "rgb(var(--shaft-crimson-text))" }}
                  >
                    {t("offers.proof")}{" "}
                  </span>
                  {offer.proof.href ? (
                    <Link
                      href={offer.proof.href}
                      className="underline underline-offset-4 transition-opacity hover:opacity-70"
                      style={{ color: "rgb(var(--shaft-cream-dim))" }}
                    >
                      {offer.proof.label}
                    </Link>
                  ) : (
                    <span style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                      {offer.proof.label}
                    </span>
                  )}
                </p>
              </div>

              {/*
                The slip the visitor was routed to ends in a form, not a
                mailto. Both answers prefill the message, so what lands in
                /admin/enquiries already says which of the three this is
                about, what the problem is and when they want it — in their
                own words — and the lead is durable the moment they press
                send rather than depending on a mail client existing.
              */}
              {narrowed && routed === offer.num && (
                <ShaftEnquiryForm
                  className="mt-8 border-t pt-8"
                  projectType={offer.title}
                  transcript={intakeManifest(offer.title)}
                  email={EMAIL}
                />
              )}

              {/* The punch: what makes a catalogue card a catalogue card. */}
              <span
                aria-hidden="true"
                className="mx-auto mt-8 block h-2.5 w-2.5 rounded-full border"
                style={{ borderColor: "rgb(var(--shaft-border))" }}
              />
            </motion.article>
          ))}
        </div>

        {/* CTA Under Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 md:mt-24 max-w-xl"
        >
          {/*
            "I don't know yet" resolves here rather than to a slip. The rule
            widens and the line brightens so the answer visibly lands
            somewhere instead of appearing to do nothing.
          */}
          <div
            className="mb-8 h-px transition-all duration-500"
            style={{
              width: answer === "d" ? "100%" : "4rem",
              backgroundColor: "rgb(var(--shaft-crimson))",
            }}
          />
          <p
            className="font-playfair text-xl leading-snug transition-colors duration-500 md:text-2xl"
            style={{
              color:
                answer === "d"
                  ? "rgb(var(--shaft-cream))"
                  : "rgb(var(--shaft-cream-dim))",
            }}
          >
            {t("offers.cta")}
          </p>
          {/*
            The same form as the slips. Someone who picked "I don't know yet"
            is the visitor most worth capturing and the least able to write a
            subject line, so this is the one place the message genuinely does
            start empty — the placeholder asks the question instead.
          */}
          {answer === "d" && (
            <ShaftEnquiryForm
              className="mt-8 border-t pt-8"
              projectType={t("offers.section")}
              transcript={intakeManifest()}
              email={EMAIL}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
