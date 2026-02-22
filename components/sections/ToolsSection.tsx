"use client";

import { LogoCloud } from "@/components/ui/logo-cloud-3";

const toolLogos = [
    {
        src: "https://svgl.app/library/vercel.svg",
        alt: "Vercel",
    },
    {
        src: "https://svgl.app/library/supabase.svg",
        alt: "Supabase",
    },
    {
        src: "https://svgl.app/library/stripe.svg",
        alt: "Stripe",
    },
    {
        src: "https://svgl.app/library/github_light.svg",
        alt: "GitHub",
    },
    {
        src: "https://svgl.app/library/claude-ai-icon.svg",
        alt: "Claude AI",
    },
    {
        src: "https://svgl.app/library/cursor_light.svg",
        alt: "Cursor",
    },
    {
        src: "https://svgl.app/library/notion.svg",
        alt: "Notion",
    },
    {
        src: "https://svgl.app/library/figma.svg",
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
