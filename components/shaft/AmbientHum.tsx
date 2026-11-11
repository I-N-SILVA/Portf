"use client";

import { useEffect, useRef } from "react";
import { useSoundPreference } from "@/hooks/useSoundEffects";

/**
 * A projector-room bed under the landing: filtered noise for the film grain
 * and a faint low hum for the lamp. Synthesised, so there's no file to load.
 *
 * Off unless the visitor has switched sound on (it starts muted for
 * everyone). Fades rather than cuts, and goes quiet while the tab is hidden.
 * Browsers only start audio after a gesture, so a reload with sound on waits
 * for the first click or key.
 */
const LEVEL = 0.035;

export default function AmbientHum() {
  const [soundOn] = useSoundPreference();
  const graph = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  useEffect(() => {
    if (!soundOn) {
      const g = graph.current;
      if (g) g.gain.gain.setTargetAtTime(0, g.ctx.currentTime, 0.25);
      return;
    }

    if (!graph.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);

      // Grain: two seconds of brown-ish noise, looped, low-passed.
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 700;
      noise.connect(lp).connect(gain);
      noise.start();

      // Lamp: a quiet 60 Hz tone.
      const hum = ctx.createOscillator();
      hum.frequency.value = 60;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.25;
      hum.connect(humGain).connect(gain);
      hum.start();

      graph.current = { ctx, gain };
    }

    const { ctx, gain } = graph.current;
    const fadeIn = () => {
      if (document.hidden) return;
      void ctx.resume();
      gain.gain.setTargetAtTime(LEVEL, ctx.currentTime, 0.6);
    };
    const onVisibility = () => {
      if (document.hidden) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      else fadeIn();
    };
    fadeIn();
    window.addEventListener("pointerdown", fadeIn, { once: true });
    window.addEventListener("keydown", fadeIn, { once: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerdown", fadeIn);
      window.removeEventListener("keydown", fadeIn);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [soundOn]);

  useEffect(() => () => void graph.current?.ctx.close(), []);

  return null;
}
