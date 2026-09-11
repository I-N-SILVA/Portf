---
name: silva-check
description: Run the browser audit for this site — contrast in both themes, no-JS rendering, reduced motion, and mobile overflow — across the public routes, then fix whatever it finds. Use when asked to check the UI, verify a visual change, audit accessibility or contrast, or before shipping anything that touches styling or layout.
---

# silva-check

`npm run verify` proves the code compiles, lints and that the pure logic
behaves. It cannot see any of the defects this project actually ships:

- text that vanishes in one of the two themes
- a page that renders blank without JavaScript
- an animation that ignores `prefers-reduced-motion`
- a layout that scrolls sideways at phone width

Every one of those has happened here, and every one was found by opening a
browser and measuring. `scripts/silva-check.mjs` does the measuring.

## Running it

It needs something serving the site. A production build, not `next dev` —
dev mode has different CSP and different chunking.

```bash
npm run build
npx next start -p 3001 &
npm run check:ui -- --port 3001
```

Narrow it while iterating:

```bash
npm run check:ui -- --port 3001 --routes /,/studio/lab
```

Exit code is 0 only if everything passes, so it can gate a commit.

## Restarting the server after a rebuild

`next start` serves the build that existed when it booted. Rebuild without
restarting and every chunk 404s, which surfaces as `ChunkLoadError` and an
error boundary — the audit then reports "page is effectively empty", which
looks like a rendering bug and is not one. **Kill and restart the server
after every `npm run build`.**

```bash
kill $(ps -eo pid,args | grep "[n]ext-server" | awk '{print $1}' | head -1)
```

## Reading the output

Three kinds of line come back.

**Failures** are real and block. Fix the code, not the threshold.

**"sit on a gradient or image and were not measured"** means text over a
picture or a gradient, which has no single colour to compare against. Check
those by eye — text on an image is where contrast usually dies.

**Nothing reported** is not proof a route is fine if the route was never
visited. Check the route list at the top of the run.

## Fixing contrast failures

Reach for a theme token, never an absolute colour. `text-white` on a
translucent dark background is correct on the dark theme and invisible on the
light one — that exact pattern hid the intro's only escape hatch at 1.10:1.

The audited pairs are `--shaft-cream` on `--shaft-bg`, `--shaft-muted` for
secondary text, and `--shaft-crimson-text` for accents (the plain
`--shaft-crimson` is a *surface* colour and fails as text). `--shaft-border`
is a border colour and fails as text in both themes.

## What it deliberately does not check

Keyboard traps, focus order, screen-reader output, and anything requiring
judgement about whether copy is good. Those still need a person.
