"use client";

import Image from "next/image";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

/**
 * The hero's signature moment: the cut-paper portrait, sliced into horizontal
 * strips that sit at different depths. The cursor drifts them apart like
 * layers of paper on a desk; scrolling fans them out; hovering (Cut B) snaps
 * them flat into one clean frame. With reduced motion it is a single image.
 *
 * Each strip is the same image clipped to a band, so the art never needs to
 * be redrawn in layers.
 */
const STRIPS = 7;

function Strip({
  i,
  src,
  mx,
  my,
  scroll,
  flat,
}: {
  i: number;
  src: string;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  scroll: MotionValue<number>;
  flat: boolean;
}) {
  const band = 100 / STRIPS;
  const mid = (STRIPS - 1) / 2;
  const depth = ((i % 2 === 0 ? 1 : -1) * (0.6 + (Math.abs(i - mid) / mid) * 0.9));
  const fan = (i - mid) * 7;

  const x = useTransform([mx, scroll], ([vx, s]: number[]) => (flat ? 0 : vx * depth * 2.2 + s * fan * 6));
  const y = useTransform([my, scroll], ([vy, s]: number[]) => (flat ? 0 : vy * depth * 0.8 + s * (i - mid) * 18));
  const rotate = useTransform(scroll, (s: number) => (flat ? 0 : s * (i - mid) * 1.6));

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{
        clipPath: `inset(${(i * band).toFixed(3)}% 0 ${(100 - (i + 1) * band).toFixed(3)}% 0)`,
        x,
        y,
        rotate,
        transition: "clip-path 0.3s",
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        priority={i === 0}
        sizes="(min-width: 768px) 30vw, 1px"
        className={`object-cover object-top transition-transform duration-500 ease-out ${flat ? "scale-[1.04]" : "scale-100"}`}
      />
      {/* torn-edge shadow along the top of every strip but the first */}
      {i > 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 h-2 pointer-events-none"
          style={{
            top: `${i * band}%`,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)",
            opacity: flat ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        />
      )}
    </motion.div>
  );
}

export default function PaperPortrait({
  src,
  mx,
  my,
  scroll,
  flat,
}: {
  src: string;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  scroll: MotionValue<number>;
  flat: boolean;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <Image src={src} alt="" fill priority sizes="(min-width: 768px) 30vw, 1px" className="object-cover object-top" />;
  }
  return (
    <>
      {Array.from({ length: STRIPS }, (_, i) => (
        <Strip key={i} i={i} src={src} mx={mx} my={my} scroll={scroll} flat={flat} />
      ))}
    </>
  );
}
