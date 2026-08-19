import { ImageResponse } from "next/og";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/components/og/OgCard";
import { resolveClientScope } from "@/lib/os/client-scope";

export const alt = "Prepared by Ian N. Silva";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * The card that renders when a pitch link is pasted into Slack, iMessage or a
 * DM — which is how every one of these links actually travels. A generic
 * preview and a personalised one are the same amount of work to send and are
 * not the same pitch.
 *
 * It names the client only when their page is published, which is exactly the
 * `access: "public"` branch of `resolveClientScope`. A crawler has no session,
 * so an unpublished space falls through to the generic card and gives away
 * nothing about whether that slug exists.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scope = await resolveClientScope(slug);

  const personalised = scope.access === "public" ? scope.page : null;

  return new ImageResponse(
    (
      <OgCard
        eyebrow={personalised ? `Prepared for ${personalised.display_name}` : "Proposal"}
        title={personalised?.headline ?? "A proposal, written for you"}
        subtitle={
          personalised
            ? "Selected work, scope, and what happens next."
            : "AI automation and product work."
        }
      />
    ),
    size,
  );
}
