"use client";

import { useState } from "react";
import Operator from "./Operator";
import BrandLoading from "./BrandLoading";
import { useBrandMotion, MotionToggle } from "./BrandMotion";
import styles from "./Brand.module.css";

export default function OperatorShowcase() {
  const [pose, setPose] = useState<"idle" | "runner">("runner");
  const [replay, setReplay] = useState(0);
  const [loading, setLoading] = useState(false);
  const { enabled } = useBrandMotion();
  return <section className={styles.showcase} aria-labelledby="operator-title">
    <div className={styles.showcaseCopy}>
      <p className={styles.eyebrow}>Built for the work / AB + AC</p>
      <h2 id="operator-title">Quiet character.<br />Clear intent.</h2>
      <p>The Operator brings the identity to life through short, purposeful gestures. Choose a pose or preview the real loading component.</p>
      <div className={styles.controls}>
        <button type="button" aria-pressed={!loading && pose === "idle"} onClick={() => { setLoading(false); setPose("idle"); setReplay(v=>v+1); }}>Stand by</button>
        <button type="button" aria-pressed={!loading && pose === "runner"} onClick={() => { setLoading(false); setPose("runner"); setReplay(v=>v+1); }}>Get moving</button>
        <button type="button" aria-pressed={loading} onClick={() => setLoading(v=>!v)}>Loading preview</button>
      </div>
      <div className={styles.controls}><button type="button" disabled={!enabled || loading} onClick={() => setReplay(v=>v+1)}>Replay animation ↗</button><MotionToggle /></div>
    </div>
    <div className={styles.stage}>
      <span className={styles.stageCorner} aria-hidden="true">+</span>
      {loading ? <BrandLoading label="Loading preview" /> : <Operator size={380} pose={pose} playKey={replay} label={pose === "idle" ? "Operator Black Label standing with a cable" : "Frame Runner carrying a viewfinder"} />}
      <span className={styles.stageCaption}>{loading ? "Demonstration · no request in progress" : "IAN SILVA / OPERATOR SERIES"}</span>
    </div>
  </section>;
}
