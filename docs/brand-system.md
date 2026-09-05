# Ian Silva — brand system

The approved direction combines AA **Silva Mask** with AB **Operator Black Label** and AC **Frame Runner**. The identity is grounded in Ian’s green baseball cap, a restrained mouthless character and a clear creative point of view. The intended tone is capable, direct and curious, with playful details. Avoid adding a cheek dot, mouth, shushing gesture or substitute bucket hat.

## Palette and hierarchy

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0A0B0A` | Main type, outlines, dark sections, silhouette |
| Olive | `#6F9554` | Cap, large graphic fields, selected controls with ink text |
| Paper | `#F1EFE7` | Main canvas, text on dark sections |
| Cobalt | `#3047E8` | Primary action, keyboard focus, small functional accents |

Use paper and ink for most of a composition. Olive is the recognisable brand colour; cobalt provides a small, functional contrast. Avoid treating every surface as an accent opportunity. Palette values apply to CSS and design templates; raster concept art includes natural intermediate shades and antialiasing.

Calculated WCAG contrast ratios for these exact flat colours:

- Ink on paper: **17.12:1**.
- Ink on olive: **5.73:1**.
- Paper on cobalt, or cobalt on paper: **5.71:1**.
- Olive on paper: **2.99:1**; do not use it for body text, small labels or essential thin icons. Use ink for those elements.

Status must also use words or icons. Do not communicate success, loading or selection through colour alone. Keep a visible native cursor and a contrasting keyboard focus indicator.

## Typography

- **Syne**: expressive display headlines and wordmarks; 700–800 weight. Tightly set headlines, short phrases, generous separation from body copy.
- **Inter**: navigation, forms, descriptions and long-form reading. Prefer 16px or larger for body text and a line height around 1.5.
- **Space Mono**: short labels, chapter numbers, metadata and diagrams. Keep it sparse; avoid paragraphs in all caps.

All export templates embed the installed local fonts, so they render without external font services. Display lettering may overlap or use an outline in large compositions, while supporting text remains solid and readable. Do not apply outline typography to instructions, action labels or reading content.

## Logo and Operator

AA is the primary icon: favicon, nav mark, profile image, small signature and watermark. AB and AC extend the identity into illustration and motion. A mascot should appear where it adds context or personality, with a quiet area around the face and cap.

Keep at least one quarter of the mark’s height as clear space. At small sizes, prioritise the whole silhouette and visor. Use prepared icon crops at 16, 32 and 48 pixels; do not simply reduce a full composition with a large border. Revisit sub-32px face detail during final vector refinement. A dark-background use must preserve the black silhouette with a paper container or the prepared contrast treatment.

Retain the cap shape, eye language, olive/ink balance and mouthless face across new poses. Full-body silhouettes may stretch during animation, but the head should remain recognisable. Do not introduce new coloured facial accents, different footwear language or a different hat merely to make a new pose feel distinct.

The current production assets are raster PNGs derived from approved artwork. They are not editable vector masters or a skeletal character rig. Future expression and limb animation needs a layered SVG redraw or a properly rigged animation file. Translating, rotating or revealing the complete PNG should never be described as facial animation.

## Motion language

Use motion to explain state or guide attention. The Operator can arrive beside a workflow, carry a frame around a project image or signal that a real request is pending. Normal navigation and work content must remain accessible without animation.

Timing guidance (with the current Operator timings noted):

| Interaction | Timing | Behaviour |
| --- | --- | --- |
| Button, focus and selection | 120–180ms | Small colour or position change |
| Section or card entrance | 350–550ms | One short reveal, then rest |
| Operator arrival | 900ms idle / 1500ms runner | One complete-art travel/tilt, then rest |
| Genuine loading state | Slow loop while pending | Pair with readable status text |
| Route transition | Under 250ms if used | Never delay navigation for a flourish |

Respect `prefers-reduced-motion` and the site motion setting. Provide static alternatives and remove continuous travel or bounce. Pause nonessential activity off-screen. Avoid scroll hijacking, artificial loading delays, particle fields, cursor replacement and repeated full-screen interruptions. The Operator should not cover navigation, form fields or project details.

## Reusable materials

Run `node scripts/export-brand-materials.mjs` from the repository root. It reads the approved art in `public/brand`, embeds that art and local fonts, and renders each template with Playwright. Edit the text/layout in the script, then rerun it; export sizes are explicit rather than dependent on a browser window.

| File stem | Size | Purpose |
| --- | --- | --- |
| `01-studio-introduction` | 1080 × 1080 | Introduction and positioning |
| `02-workflow-field-notes` | 1080 × 1350 | Educational post with three actionable steps |
| `03-notchy-project` | 1200 × 630 | Existing independent NOTCHY project announcement |
| `04-studio-story` | 1080 × 1920 | Vertical studio story; content inset from top/bottom UI areas |
| `05-brand-board` | 1600 × 1040 | Overview of icon, mascot, palette and type |

Run `node scripts/package-brand-kit.mjs` after artwork or documentation changes to refresh the downloadable ZIP, icon copies, palette JSON and guide.

Each file is exported to `public/brand/social` as a standalone editable `.html` and ready-to-share `.png`. Nothing is posted automatically. Templates avoid invented testimonials, client names, performance statistics and business outcomes. The NOTCHY art comes from the existing portfolio at `public/projects/notchy.webp`; the template labels it an independent project.

Before posting, write meaningful alt text, confirm the copy and add a real destination link in the publishing interface. The PNG text cannot function as a link. Story platform overlays vary, so check the actual composer before publishing.

## Experience improvements and order

### Current deliverables

This rollout adds the brand artwork, favicon treatment, palette alignment for Studio, an Operator motion layer with reduced-motion behaviour, loading-state artwork, and a Studio brand gallery. The accompanying social package provides five editable layouts and exports. Check the implementation and final release report for deployment status; preparing these files does not itself publish the site or social posts.

Implemented interaction details:

- **AA signature:** favicon, home-screen icons, Studio navigation and footer; a short tilt on linked marks.
- **Workflow guide:** the selected step changes the Operator pose and its explanatory line. There is no autonomous agent implied by this illustration.
- **Operator entrances:** one finite arrival when the artwork enters view; explicit replay controls in the library.
- **Honest loading:** Operator artwork accompanies existing OS route loading and contact submission. The library has a clearly labelled loading demonstration. The public Studio retains server-rendered content without a blocking loading boundary.
- **Motion preference:** the footer and library expose one saved setting. System reduced motion takes priority; CSS movement and Studio reveals stop when disabled.
- **Navigation and reading:** native cursor retained, mobile bottom navigation, contrasting focus outlines, and content readable without animation.

### Next: finish the core identity

1. **Draw a true vector master.** Clean the silhouette, cap seams, eye cut-outs and small-size variant. This improves favicon legibility, print scaling and future animation. Keep the approved visual direction; do not restart the concept process.
2. **Build a small pose library.** Idle, carrying a frame, pointing to a result and celebrating are enough to start. Use the same head and cap in every pose. Add an error/help pose that feels calm rather than mocking a user’s failure.
3. **Design the wordmark.** Develop one restrained `IAN SILVA` lockup to accompany AA. Validate a horizontal version, stacked version and plain text fallback before applying custom letter effects throughout the site.

### Next: elevate the website where it matters

1. **Make case studies tangible.** Show the starting problem, a real workflow diagram, the shipped interface and the practical result. Add verified outcome data only when available. Strong work evidence will improve credibility more than extra ambient effects.
2. **Use the Operator as a guide.** Place a static pose beside the workflow, animate once when a useful result appears, and keep it still while the visitor reads. A future vector rig can handle eye glances and arm movement; the current image does not provide those independently.
3. **Add project framing on deliberate interaction.** On keyboard focus or hover, let AC’s frame reveal one project preview with a short transition. Make the project link visible without hovering.
4. **Keep consultation entry simple.** One clear primary contact action, a short scope prompt and an honest explanation of the next step. Form errors should identify exactly what needs fixing.
5. **Make waiting honest.** Tie loaders to actual work, preserve readable labels and show completion or actionable errors. Do not invent progress percentages for operations without measurable progress.
6. **Measure before adding more.** Check contact completion, project clicks, mobile readability, reduced-motion behaviour and image/bundle weight. Use the evidence to choose the next interaction.

### Later: a distinctive editorial rhythm

Develop a repeatable post series: Workflow Field Notes, Build Breakdown and Operator Experiments. Each should reuse the palette and type hierarchy with a single featured idea. Add one branded carousel template after the first posts establish the right amount of content. Explore a short intro animation and email signature after the vector master and wordmark are stable.

Avoid launching an elaborate mascot configurator, sound effects or a full cinematic preloader before the case studies and consultation path are strong. Those additions cost attention and maintenance; the brand should make the work easier to recognise and understand.
