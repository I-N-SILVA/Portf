import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StudioNavLinks from "@/components/studio/StudioNavLinks";
import StudioScrollProgress from "@/components/studio/StudioScrollProgress";
import { routes } from "@/lib/routes";
import styles from "./StudioNav.module.css";

export default function StudioNav() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.brandGroup}>
          <Link href={routes.home} className={styles.back} aria-label="Back to the portfolio">←</Link>
          <Link href={routes.studio.root} className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">IS</span>
            <span>Ian N. Silva</span>
          </Link>
        </div>
        <StudioNavLinks />
        <div className={styles.actions}>
          <Link href={routes.portal} className={styles.portal}>Client portal</Link>
          <Link href={routes.studio.section("contact")} className={styles.contact} aria-label="Discuss a workflow">
            <span className={styles.contactLong}>Discuss a workflow</span>
            <span className={styles.contactShort}>Discuss AI</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
      <StudioScrollProgress />
    </header>
  );
}
