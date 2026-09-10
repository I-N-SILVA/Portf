import Operator from "./Operator";
import styles from "./Brand.module.css";

export default function BrandLoading({ label = "Preparing your workspace", compact = false }: { label?: string; compact?: boolean }) {
  return <div className={`${styles.loading} ${compact ? styles.loadingCompact : ""}`} role="status" aria-live="polite">
    <Operator pose="runner" size={compact ? 82 : 160} />
    <div><p className={styles.loadingLabel}>{label}</p>
      <span className={styles.loadingRail} aria-hidden="true"><span /></span>
      <span className={styles.loadingHint}>One moment.</span>
    </div>
  </div>;
}
