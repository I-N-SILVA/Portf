"use client";

import React from "react";
import { InfiniteSlider } from "./infinite-slider";

const TICKER_ITEMS = [
    "IAMNSILVA",
    "DESIGN",
    "CODE",
    "AI",
    "VIBE CODING",
    "RETRO OS",
    "SYSTEMS",
    "IDENTITY",
    "EXPERIENCE"
];

export default function TextTicker() {
    return (
        <div className="w-full border-y border-border bg-primary/5 py-4 overflow-hidden select-none">
            <InfiniteSlider gap={64} speed={40}>
                {TICKER_ITEMS.map((item, i) => (
                    <div key={i} className="flex items-center gap-8">
                        <span className="text-4xl md:text-6xl font-black tracking-[0.2em] uppercase opacity-20 font-syne">
                            {item}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                    </div>
                ))}
            </InfiniteSlider>
        </div>
    );
}
