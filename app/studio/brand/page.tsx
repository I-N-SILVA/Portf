import { siteUrl } from "@/lib/routes";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";
import OperatorShowcase from "@/components/brand/OperatorShowcase";
import styles from "./page.module.css";

export const metadata: Metadata = { alternates: { canonical: siteUrl("/studio/brand") }, title: "Brand & motion library", description: "The Ian Silva identity: approved marks, Operators, motion and ready-to-use social templates." };

const posts = [
  ["01-studio-introduction", "Studio introduction", "1080 × 1080 / Square"],
  ["02-workflow-field-notes", "Workflow field notes", "1080 × 1350 / Portrait"],
  ["03-notchy-project", "Project announcement", "1200 × 630 / Landscape"],
  ["04-studio-story", "Studio story", "1080 × 1920 / Story"],
  ["05-brand-board", "Identity board", "1600 × 1040 / Reference"],
];
const palette = [["Ink", "#0A0B0A", "Primary text & silhouette"], ["Olive", "#6F9554", "The cap & signature surfaces"], ["Paper", "#F1EFE7", "Editorial canvas"], ["Cobalt", "#3047E8", "Interaction & cap label"]];

export default function BrandPage() {
  return <main className={styles.page}>
    <header className={styles.hero}>
      <div><p className={styles.eyebrow}>Ian Silva / Identity system 01</p>
        <h1>A little edge.<br /><span>A lot of intent.</span></h1>
        <p className={styles.lede}>One cap. A recognisable cast. A system made for thoughtful work, useful motion and a distinctly human point of view.</p>
        <div className={styles.links}><a href="/brand/ian-silva-brand-kit.zip" download>Download the brand kit ↗</a><a href="/brand/brand-system.md" download>Read the full breakdown ↗</a></div>
      </div>
      <div className={styles.logoPlate}><BrandMark size={320} /><span>AA / SILVA MASK</span></div>
    </header>

    <section aria-labelledby="palette-title" className={styles.section}>
      <p className={styles.eyebrow}>01 / Colour with a purpose</p><h2 id="palette-title">The four constants.</h2>
      <div className={styles.palette}>{palette.map(([name, hex, purpose]) => <div key={name}><div className={styles.swatch} style={{ background: hex }} /><h3>{name} <code>{hex}</code></h3><p>{purpose}</p></div>)}</div>
      <p className={styles.note}>Use ink on olive and paper on cobalt. Small green text uses the darker olive companion, #3F5B2B. Colour signals a function; it never carries meaning alone.</p>
    </section>

    <section className={styles.type} aria-labelledby="type-title">
      <div><p className={styles.eyebrow}>02 / Type with a point of view</p><h2 id="type-title">Think clearly.<br /><span>Make boldly.</span></h2><p>Syne / Headlines, bold and closely spaced.</p></div>
      <div><p className={styles.bodySample}>Good systems give people room to do their best work.</p><p>Inter / Body copy, readable and direct.</p><div className={styles.monoSample}>01 — DIAGNOSE / PROVE / EMBED</div><p>Space Mono / Navigation, captions and indices.</p></div>
    </section>

    <OperatorShowcase />

    <section className={styles.section} aria-labelledby="assets-title">
      <p className={styles.eyebrow}>03 / The original cast</p><h2 id="assets-title">Three assets. One family.</h2>
      <div className={styles.assets}>{[["aa-mark", "AA / Silva Mask"], ["operator-idle", "AB / Black Label"], ["operator-runner", "AC / Frame Runner"]].map(([file,title]) => <article key={file}><div><Image src={`/brand/${file}.webp`} alt={title} width={300} height={300} className={styles.assetImage}/></div><h3>{title}</h3><a href={`/brand/${file}.png`} download>Transparent PNG ↓</a></article>)}</div>
      <p className={styles.note}>These are raster production assets. The favicon is derived from AA. Vector masters and independent limb animation are the next production step; the current animations move the complete artwork.</p>
    </section>

    <section className={styles.section} aria-labelledby="posts-title">
      <p className={styles.eyebrow}>04 / Ready to make your own</p><h2 id="posts-title">From the Studio.<br />To the feed.</h2>
      <p className={styles.lede}>Four post designs and an identity board. Download a PNG, or edit the self-contained HTML template and re-export it. Copy stays specific; project posts make no invented performance claims.</p>
      <div className={styles.posts}>{posts.map(([file,title,format]) => <article key={file}><a href={`/brand/social/${file}.png`} download aria-label={`Download ${title} PNG`}><Image src={`/brand/social/${file}.png`} alt={`${title} layout in the Ian Silva palette`} width={540} height={540} className={styles.postImage}/></a><p className={styles.eyebrow}>{format}</p><h3>{title}</h3><div className={styles.links}><a href={`/brand/social/${file}.png`} download>PNG ↓</a><a href={`/brand/social/${file}.html`} download>Editable HTML ↓</a></div></article>)}</div>
    </section>

    <section className={styles.next} aria-labelledby="next-title"><p className={styles.eyebrow}>05 / Where the identity goes next</p><h2 id="next-title">Make the work<br />the main event.</h2>
      <ol><li><strong>Show decisions, not just screenshots.</strong> Give each flagship case study a before/after workflow, a live example and measured outcomes where evidence exists.</li><li><strong>Give the Operator a small vocabulary.</strong> Build layered vector poses for arriving, framing, connecting and handing over. Keep the mouthless face and low cap consistent.</li><li><strong>Let one interaction lead.</strong> Expand the workflow rail into a genuine explorable demo. Keep reading, navigation and contact fast.</li><li><strong>Keep the feed recognisable.</strong> Publish useful field notes, project decisions and lessons using the same four templates. Change the content more often than the layout.</li></ol>
      <Link href="/studio">Back to the Studio ↗</Link>
    </section>
  </main>;
}
