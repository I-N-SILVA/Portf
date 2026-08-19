"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { MouseProvider } from "@/components/context/MouseContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {/*
        `reducedMotion="user"` makes every motion component below this point
        honour the OS "reduce motion" setting.

        globals.css already neutralises CSS animations and transitions under
        that media query, but almost nothing on this site animates in CSS —
        framer-motion writes transforms straight onto the element from
        JavaScript, which no stylesheet can reach. So the landing page kept
        parallaxing, sliding and scrambling for people who had explicitly
        asked it not to. This is the switch that actually turns it off:
        transforms and layout animation are dropped, opacity fades are kept,
        and no component had to be touched.
      */}
      <MotionConfig reducedMotion="user">
        <MouseProvider>{children}</MouseProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
