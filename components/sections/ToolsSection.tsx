"use client";

import { LogoCloud } from "@/components/ui/logo-cloud-3";

const toolLogos = [
    {
        src: "https://svgl.app/library/vercel_wordmark.svg",
        alt: "Vercel",
    },
    {
        src: "https://svgl.app/library/supabase_wordmark_light.svg",
        alt: "Supabase",
    },
    {
        src: "https://svgl.app/library/stripe_wordmark.svg",
        alt: "Stripe",
    },
    {
        src: "https://svgl.app/library/github_wordmark_light.svg",
        alt: "GitHub",
    },
    {
        src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg",
        alt: "Claude AI",
    },
    {
        src: "https://svgl.app/library/cursor-wordmark-light.svg",
        alt: "Cursor",
    },
    {
        src: "https://svgl.app/library/notion_wordmark.svg",
        alt: "Notion",
    },
    {
        src: "https://svgl.app/library/figma_wordmark.svg",
        alt: "Figma",
    },
];

export default function ToolsSection() {
    return (
        <section className="py-16 relative">
            <div className="container mx-auto px-6">
                <div className="relative mx-auto max-w-3xl">
                    <LogoCloud logos={toolLogos} />
                </div>
            </div>
        </section>
    );
}
