import BrandMark from "./BrandMark";
import styles from "./Brand.module.css";

export default function BrandLoading({ label = "Preparing your workspace", compact = false }: { label?: string; compact?: boolean }) {
  return <div className={`${styles.loading} ${compact ? styles.loadingCompact : ""}`} role="status" aria-live="polite">
    <BrandMark size={compact ? 40 : 72} />
    <div><p className={styles.loadingLabel}>{label}</p>
      <span className={styles.loadingRail} aria-hidden="true"><span /></span>
      <span className={styles.loadingHint}>One moment.</span>
    </div>
  </div>;
}
