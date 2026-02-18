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
                    <h2 className="mb-5 text-center font-medium text-xl tracking-tight md:text-2xl">
                        <span className="text-muted-foreground">Built with</span>
                        <br />
                        <span className="font-bold text-foreground">the best tools.</span>
                    </h2>

                    <div className="mx-auto my-5 h-px max-w-sm bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

                    <LogoCloud logos={toolLogos} />

                    <div className="mt-5 h-px bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
                </div>
            </div>
        </section>
    );
}
