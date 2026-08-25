import { createClient as createRawClient } from "@supabase/supabase-js";
import { devPitchRoom } from "@/lib/client-content";
import { isValidSlug } from "@/lib/routes";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import type { Database, PublicClientPage } from "@/lib/supabase/types";

export const alt = "Prepared for you";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * The card a prospect sees before they open the link.
 *
 * `/c/{slug}` is the one URL sent to a client, so it is the share preview
 * that matters most on the whole site — and it had none, only the site-wide
 * square. This names them.
 *
 * It resolves through `get_public_client_page`, the same SECURITY DEFINER
 * function the anonymous pitch page uses, so it can only ever show what a
 * stranger visiting that URL would already see. An unpublished page, an
 * unknown slug, or no backend at all falls through to a generic card, which
 * means the preview never confirms whether a given slug exists.
 */

// Per-request: a pitch page can be published or renamed at any time, and a
// prerendered card would keep unfurling the old answer.
export const dynamic = "force-dynamic";

async function publishedPage(slug: string): Promise<PublicClientPage | null> {
  if (!isValidSlug(slug)) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return devPitchRoom(slug) ?? null;

  try {
    const supabase = createRawClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await supabase
      .rpc("get_public_client_page", { p_slug: slug })
      .maybeSingle();
    return (data as PublicClientPage) ?? null;
  } catch {
    // A card is a nice-to-have; never let it take the page down with it.
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await publishedPage(slug);

  if (!page) {
    return ogCard({
      eyebrow: "Ian N. Silva",
      title: "A proposal, prepared by hand",
      subtitle: "AI automations, landing pages and MVPs you can test in weeks.",
    });
  }

  return ogCard({
    eyebrow: "Prepared for",
    title: page.display_name,
    subtitle: page.headline ?? undefined,
    footer: `iamnsilva.me/c/${slug}`,
  });
}
