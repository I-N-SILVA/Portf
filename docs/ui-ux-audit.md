# UI/UX audit — September 2026

## Product model

The repository contains three experiences with different jobs:

1. The portfolio at `/` earns attention and proves capability.
2. The studio at `/studio` explains services and captures demand.
3. The client and admin spaces handle ongoing work.

The cinematic archive concept is memorable and worth keeping. The main usability problem was that the interface often protected the concept at the expense of the visitor's task: understanding what Ian does, seeing credible work, and choosing a next step.

## Findings and changes

### P0 — the development site did not hydrate

The CSP blocked the evaluation used by the Next.js development runtime. React never hydrated, Framer Motion elements stayed at their server-rendered `opacity: 0`, and the page appeared almost entirely black. The policy now permits `unsafe-eval` only in development. The production policy remains unchanged.

### P1 — the page root added an unnecessary blank transition

The intro was hidden before hydration for returning visitors, while the page root still started transparent. This created a blank transition even when the intro had already been skipped. The root is now visible by default; the intro overlay provides the visual transition. Motion-sensitive visitors see hero content immediately instead of waiting through JavaScript delays. First-time visitors can now skip the cinematic sequence, and that choice is remembered for the rest of the session.

### P1 — portfolio proof required discovery and interaction

Project rows previously exposed a title and stack while hiding the role behind a redaction effect and the actual summary behind expansion. This made the archive dramatic but weak as evidence. Each row now shows the project summary and role at a glance, while expansion still reveals imagery, features, links, and deeper detail.

### P1 — the hero had one premature conversion route

The hero offered only “Schedule a call.” Many first-time visitors need proof before committing. The hero now pairs “View selected work” with the call action, supporting both evaluation and high-intent visitors.

### P1 — typography treated functional text as decoration

Important labels and descriptions frequently used 7–9 px type with extreme tracking. The hero proposition, project summaries, tags, roles, and primary controls now use larger type, tighter tracking, and more useful line height. Tiny type remains only in decorative system telemetry.

### P1 — the mobile header and anchor targets collided

The fixed control cluster had no surface and section navigation could place content underneath it. The mobile header now has a translucent bordered surface, controls have 40 px minimum targets, and section anchors reserve space for the header.

### P1 — sound started without affirmative consent

The interface preference defaulted to sound on and the intro could trigger audio before a visitor understood the control. Sound now starts muted for a new visitor and remains an explicit, remembered opt-in.

### P1 — Studio reveals could hide the entire page

Studio content was server-rendered with inline `opacity: 0` and depended on an intersection animation to become readable. With JavaScript disabled or reduced motion enabled, the reveal could remain permanently blank. Reveal content is now visible in the initial HTML and enhanced after hydration.

### P1 — the information architecture delayed proof

The portfolio placed biography and services before project evidence, while Studio placed services before its case studies. Both experiences now show work immediately after the hero. Chapter numbers, navigation order, section labels, and translated headings follow the same sequence.

### P2 — gateways and private-area context were ambiguous

The portfolio gateway called the commercial route “Studio,” which did not describe the visitor's next task. It now says “Services” in every locale. Studio has a clear return to Portfolio, and the login page explains that the portal is for active clients while giving public visitors routes back to services and work.

### P2 — shared client/admin chrome was fragile on small screens

The shared OS header now reflows on narrow screens, exposes current-page state to assistive technology, and gives the clock, command palette, and sign-out controls explicit accessible names.

### P2 — font loading made builds network-dependent

Four Google font families were fetched during every production build. A network timeout made the build fail. The same families are now bundled through Fontsource, preserving the design while making builds repeatable and keeping font requests on the same origin.

### P2 — image sizing caused avoidable layout and download warnings

Fill images did not describe their rendered sizes and the persistent Bit-Ko control was flagged as an unprioritized above-the-fold image. Responsive sizes and priority hints now let Next.js choose smaller sources and stabilize the first paint.

## Design direction

The strongest idea is “classified technical dossier meets film chapter.” The crimson line, Playfair display face, mono captions, numbered chapters, and dark negative space all support it. Future additions should strengthen the dossier metaphor with outcomes, constraints, and artifacts rather than adding more ambient effects.

The portfolio should answer these questions in order:

1. What does Ian make, and for whom?
2. Is there convincing proof?
3. What can I hire him for?
4. How do we start?

The implemented order is selected work, identity, services, and contact. Studio follows the same proof-first logic with case studies before services and process.

## Recommended next research

- Add concrete project outcomes: adoption, time saved, release status, repository activity, or a clearly stated learning when commercial metrics do not exist.
- Measure hero-to-work clicks, project expansions, outbound project clicks, and booking starts. Use the data to decide whether the long chapter sequence earns its length.
- Run five short first-impression sessions with founders or small-team operators. Ask what Ian does, which project feels most credible, and what they would click next after five seconds.
- Test authenticated client and admin spaces with realistic dense data. Their shared OS system is structurally sound, but tables, nav overflow, empty states, and mobile task completion need live records to evaluate properly.

## Portal and Studio follow-up

The portal should behave like a work surface, so it now opens immediately, names the client's workspace, summarizes active work and attention items first, and fetches independent modules concurrently. Its mobile chrome separates identity and actions from the horizontally scrollable module navigation. The OS stylesheet is also parsed as part of verification after an unclosed animation block was found to be swallowing later rules.

Studio and the portfolio now consume one canonical active-project list. Studio shows the same project titles, descriptions, tags, roles, and banner images; projects with written case studies retain their deeper Studio route, while the rest link to their full project record.

Studio's visual system now feels like a working product studio rather than a stack of generic cards: a dark technical hero sets the proposition and portal entry, the first and last projects act as wide editorial features, services are divided like a capabilities sheet, and the process reads as a numbered production timeline. On mobile, the repeated working-model detail collapses to one line so selected work arrives sooner.

Portal entry now has one visible path from Studio and one resolver at `/portal`. Password setup continues there, all current Supabase callback formats are handled, expired links produce a useful error, and an authenticated account without a client or admin profile sees the exact linking problem instead of landing back on the homepage.

The strongest next Studio additions need real evidence rather than more interface treatment:

- Add one verified outcome to each project card, such as release status, adoption, time saved, or repository activity.
- Add one short client quote beside the most commercially relevant case study.
- Show a concrete artifact in each process step: workflow map, working prototype, and handover document.
- Replace the generic availability pill with an accurate capacity window when scheduling data is available.
- Keep the restrained editorial system and let project imagery provide the color; adding more gradients or ambient animation would weaken the proof-first hierarchy.

## Validation

- `npm run verify`: type checking, lint, dead-module check, schema parity, migration bundle parity, 113 unit tests, and the production build passed.
- `npx playwright test --workers=1`: all 22 browser tests passed, including WCAG A/AA scans, visible native cursor behavior, portal redirect preservation, intro and sound preferences, proof-first section order, JavaScript-free Studio content, and reduced-motion rendering.
- Production-build browser checks at 1440 × 1000 and 390 × 844: no horizontal overflow on the portfolio or Studio; the work CTA, project expansion, and responsive navigation passed.
- The default five-worker browser run timed out on six navigation waits on this host. The single-worker run completed in 37 seconds with all tests passing.
- Authenticated client/admin workflows were not exercised because this checkout has no service credentials.
