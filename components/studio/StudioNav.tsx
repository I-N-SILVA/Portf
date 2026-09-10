import BrandMark from "@/components/brand/BrandMark";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StudioScrollProgress from "@/components/studio/StudioScrollProgress";
import { CLIENT_SITE } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import styles from "./StudioNav.module.css";

/**
 * The header for the two public client-facing surfaces left: a prospect's
 * pitch page at /c/{slug} and the case-study records it links to.
 *
 * It used to be the studio landing's nav, so it carried that page's section
 * anchors (Services, Work, Process) and a "Discuss a workflow" link into its
 * contact form. The landing is gone, so all of those pointed at a 404. What
 * remains is what someone on a pitch page actually needs: the way back to the
 * portfolio, the way in to their portal, and a way to reply.
 */
export default function StudioNav() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.brandGroup}>
          <Link href={routes.home} className={styles.back} aria-label="Back to the portfolio">←</Link>
          <Link href={routes.home} className={styles.brand} aria-label="Ian N. Silva">
            <BrandMark size={38} />
            <span>Ian N. Silva</span>
          </Link>
        </div>
        <div className={styles.actions}>
          <Link href={routes.portal} className={styles.portal}>Client portal</Link>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className={styles.contact}
            aria-label="Email Ian about a workflow"
          >
            <span className={styles.contactLong}>Discuss a workflow</span>
            <span className={styles.contactShort}>Get in touch</span>
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
      <StudioScrollProgress />
    </header>
  );
}
