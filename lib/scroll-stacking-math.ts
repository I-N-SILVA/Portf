/**
 * Pure math helpers for scroll-stacking-cards
 */

export const host = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const easeOut = (t: number) => 1 - (1 - t) ** 3;

export const ENTER = 0.72; // share of each card's screen spent arriving; the rest it rests in place

/** How far card `j` has arrived (0 below the window, 1 landed) at deck progress `v`. */
export function arrived(j: number, v: number, count: number) {
  if (j <= 0) return 1;
  const span = Math.max(1, count - 1);
  return easeOut(clamp01((v * span - (j - 1)) / ENTER));
}

/** Number of cards lying above card `i` smoothly */
export function countAbove(i: number, v: number, count: number) {
  let n = 0;
  for (let j = i + 1; j < count; j++) n += arrived(j, v, count);
  return Math.min(3, n);
}

