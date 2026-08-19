"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ShaftDecipherProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  hoverOnly?: boolean;
}

const CHARS = "ABCDEFGHIKLMNOPQRSTVXYZ0123456789!@#$%^&*()_+";

/**
 * Text that resolves out of scrambled characters.
 *
 * The interval is held in a ref and cleared before each new run, because the
 * handler is on hover: sweeping the cursor across a heading used to start one
 * interval per pass, all of them writing to the same state and none of them
 * cleared until they happened to finish. On unmount, any live one is cleared
 * too.
 *
 * With `prefers-reduced-motion` the effect is skipped entirely — the point of
 * the component is the destination, and the animation is the part that makes
 * some people ill.
 */
export default function ShaftDecipher({
  text,
  className,
  style,
  hoverOnly = true,
}: ShaftDecipherProps) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scramble = useCallback(
    (targetText: string) => {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setDisplayText(targetText);
        return;
      }

      stop();
      let iteration = 0;
      intervalRef.current = setInterval(() => {
        setDisplayText(
          targetText
            .split("")
            .map((char, index) =>
              index < iteration
                ? targetText[index]
                : CHARS[Math.floor(Math.random() * CHARS.length)],
            )
            .join(""),
        );

        if (iteration >= targetText.length) stop();
        iteration += 1 / 3;
      }, 30);
    },
    [stop],
  );

  useEffect(() => {
    if (!hoverOnly) scramble(text);
    return stop;
  }, [text, scramble, hoverOnly, stop]);

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={() => scramble(text)}
    >
      {displayText}
    </span>
  );
}
