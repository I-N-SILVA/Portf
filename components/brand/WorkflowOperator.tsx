import Operator from "./Operator";
import styles from "./Brand.module.css";

export default function WorkflowOperator({ stage, workflow }: { stage: number; workflow: string }) {
  const labels = ["Understand the request.", "Put the tools to work.", "Keep people in control.", "Make the handover count."];
  return <div className={styles.workflowOperator}>
    <Operator pose={stage === 0 || stage === 2 ? "idle" : "runner"} size={94} playKey={`${workflow}-${stage}`} />
    <div><span className={styles.eyebrow}>Operator / 0{stage + 1}</span>
      <p aria-live="polite" aria-atomic="true">{labels[stage]}</p>
    </div>
    <span className={styles.sequence} aria-hidden="true">{[0,1,2,3].map(i => <i key={i} data-active={i <= stage} />)}</span>
  </div>;
}
