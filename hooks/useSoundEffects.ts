"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SoundType = "focus" | "close" | "maximize" | "minimize" | "click" | "shutter" | "hum" | "glitch" | "page";

/* ─── helpers ─────────────────────────────────────────────────────── */
function createFilter(ctx: AudioContext, type: BiquadFilterType, freq: number, q = 1) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function noise(ctx: AudioContext, duration: number) {
  const bufLen = Math.ceil(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

/**
 * Whether UI sound is switched on.
 *
 * Kept in a module-level store rather than React context because the hook is
 * called from a dozen components that share no provider, and every one of
 * them has to see a change made in the nav immediately. `localStorage` is the
 * source of truth; this mirrors it so `playSound` never touches storage on
 * the hot path.
 */
const STORAGE_KEY = "shaft-sound";
let enabled: boolean | null = null;
const listeners = new Set<(on: boolean) => void>();

function readPreference(): boolean {
  if (enabled !== null) return enabled;
  if (typeof window === "undefined") return false;
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    enabled = false;
  }
  return enabled;
}

export function soundEnabled(): boolean {
  return readPreference();
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((fn) => fn(on));
}

/**
 * Subscribe to the preference. Returns the current value and a setter, and
 * re-renders every consumer when any of them flips it.
 */
export function useSoundPreference(): [boolean, (on: boolean) => void] {
  // Start silent on the server and on the very first client render, then
  // correct in an effect — reading localStorage during render would make the
  // markup differ between the two and React would discard the whole tree.
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readPreference());
    listeners.add(setOn);
    return () => {
      listeners.delete(setOn);
    };
  }, []);

  return [on, setSoundEnabled];
}

export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      // Safari still only exposes the prefixed constructor.
      const AC =
        window.AudioContext ??
        (window as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") {
      // Autoplay policy may refuse this until the page has been interacted
      // with. It resolves or it doesn't; either way the caller carries on.
      void ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  useEffect(() => {
    const wake = () => getCtx();
    window.addEventListener("pointerdown", wake, { once: true });
    window.addEventListener("keydown", wake, { once: true });
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [getCtx]);

  const playSound = useCallback((type: SoundType) => {
    if (typeof window === "undefined") return;
    if (!readPreference()) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.18, now);
      master.connect(ctx.destination);

      /* ── CLICK: crisp mechanical switch ──────────────────────────── */
      if (type === "click" || type === "focus") {
        // Transient noise burst (contact)
        const click = noise(ctx, 0.003);
        const clickFilter = createFilter(ctx, "bandpass", 4000, 0.5);
        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(0.6, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        click.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(master);
        click.start(now);
        click.stop(now + 0.015);

        // Tonal body (low thunk)
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.35, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(oscGain);
        oscGain.connect(master);
        osc.start(now);
        osc.stop(now + 0.06);
      }

      /* ── SHUTTER: filmic camera snap ─────────────────────────────── */
      else if (type === "shutter") {
        // Mech thunk
        const thunk = ctx.createOscillator();
        thunk.type = "triangle";
        thunk.frequency.setValueAtTime(150, now);
        thunk.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        const thunkGain = ctx.createGain();
        thunkGain.gain.setValueAtTime(0.5, now);
        thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        thunk.connect(thunkGain);
        thunkGain.connect(master);
        thunk.start(now);
        thunk.stop(now + 0.08);

        // Ratchet click at 0.04s
        const ratch = noise(ctx, 0.018);
        const ratchFilter = createFilter(ctx, "highpass", 3500, 1.5);
        const ratchGain = ctx.createGain();
        ratchGain.gain.setValueAtTime(0, now);
        ratchGain.gain.setValueAtTime(0.7, now + 0.04);
        ratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        ratch.connect(ratchFilter);
        ratchFilter.connect(ratchGain);
        ratchGain.connect(master);
        ratch.start(now + 0.04);
        ratch.stop(now + 0.065);
      }

      /* ── HUM: atmospheric low drone ──────────────────────────────── */
      else if (type === "hum") {
        // Sine fundamental
        const fund = ctx.createOscillator();
        fund.type = "sine";
        fund.frequency.setValueAtTime(55, now);
        fund.frequency.linearRampToValueAtTime(52, now + 0.4);
        const fundGain = ctx.createGain();
        fundGain.gain.setValueAtTime(0, now);
        fundGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
        fundGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        fund.connect(fundGain);
        fundGain.connect(master);
        fund.start(now);
        fund.stop(now + 0.45);

        // 3rd harmonic shimmer
        const harm = ctx.createOscillator();
        harm.type = "sine";
        harm.frequency.setValueAtTime(165, now);
        const harmGain = ctx.createGain();
        harmGain.gain.setValueAtTime(0, now);
        harmGain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        harm.connect(harmGain);
        harmGain.connect(master);
        harm.start(now);
        harm.stop(now + 0.35);
      }

      /* ── GLITCH: digital data corruption ────────────────────────── */
      else if (type === "glitch") {
        [0, 0.025, 0.05].forEach((offset, i) => {
          const g = ctx.createOscillator();
          g.type = "square";
          g.frequency.setValueAtTime(1200 - i * 300, now + offset);
          g.frequency.setValueAtTime(200 + i * 100, now + offset + 0.012);
          const gGain = ctx.createGain();
          gGain.gain.setValueAtTime(0.2, now + offset);
          gGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.025);
          g.connect(gGain);
          gGain.connect(master);
          g.start(now + offset);
          g.stop(now + offset + 0.025);
        });

        // White noise burst
        const n = noise(ctx, 0.04);
        const nf = createFilter(ctx, "bandpass", 3000, 2);
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.15, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        n.connect(nf);
        nf.connect(ng);
        ng.connect(master);
        n.start(now);
        n.stop(now + 0.04);
      }

      /* ── MAXIMIZE: UI expand ─────────────────────────────────────── */
      else if (type === "maximize") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.25, now + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(master);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      /* ── PAGE: changing pages / rustling ────────────────────────── */
      else if (type === "page") {
        // First swish
        const n1 = noise(ctx, 0.1);
        const f1 = createFilter(ctx, "bandpass", 1500, 1.5);
        f1.frequency.exponentialRampToValueAtTime(2500, now + 0.1);
        const g1 = ctx.createGain();
        g1.gain.setValueAtTime(0, now);
        g1.gain.linearRampToValueAtTime(0.3, now + 0.02);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        n1.connect(f1); f1.connect(g1); g1.connect(master);
        n1.start(now); n1.stop(now + 0.1);

        // Second flap (slightly later and deeper)
        const n2 = noise(ctx, 0.15);
        const f2 = createFilter(ctx, "bandpass", 800, 2.0);
        f2.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0, now + 0.04);
        g2.gain.linearRampToValueAtTime(0.4, now + 0.06);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        n2.connect(f2); f2.connect(g2); g2.connect(master);
        n2.start(now + 0.04); n2.stop(now + 0.18);
      }

      /* ── MINIMIZE: UI collapse ───────────────────────────────────── */
      else if (type === "minimize" || type === "close") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.22, now + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(master);
        osc.start(now);
        osc.stop(now + 0.15);
      }

    } catch {
      // Silently fail — never crash the UI over audio
    }
  }, [getCtx]);

  return { playSound };
}
