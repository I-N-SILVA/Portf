"use client";

import { useState, useCallback } from "react";
import ShaftIntertitle from "./ShaftIntertitle";
import ShaftNav from "./ShaftNav";
import ShaftHero from "./ShaftHero";
import ShaftIdentity from "./ShaftIdentity";
import ShaftArchive from "./ShaftArchive";
import ShaftDomains from "./ShaftDomains";
import ShaftCall from "./ShaftCall";
import Cursor from "@/components/ui/inverted-cursor";

export default function ShaftLandingContent() {
  const [intertitleDone, setIntertitleDone] = useState(false);

  const onComplete = useCallback(() => setIntertitleDone(true), []);

  return (
    <>
      <ShaftIntertitle onComplete={onComplete} />

      <main
        className="w-full min-h-screen overflow-x-hidden shaft-flicker"
        style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
      >
        <Cursor />
        <ShaftNav visible={intertitleDone} />

        <ShaftHero />
        <ShaftIdentity />
        <ShaftArchive />
        <ShaftDomains />
        <ShaftCall />
      </main>
    </>
  );
}
