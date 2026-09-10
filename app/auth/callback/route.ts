import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routes, safeNext, siteUrl } from "@/lib/routes";
import type { EmailOtpType } from "@supabase/supabase-js";

const EMAIL_TYPES = new Set<EmailOtpType>([
  "email", "signup", "invite", "magiclink", "recovery", "email_change",
]);

/**
 * Code-based sign-ins and custom token-hash email templates are completed on
 * the server. Default admin invitations use an implicit-flow URL fragment;
 * only a browser can read that, so those continue at /auth/complete.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const fallback = type === "invite" || type === "recovery"
    ? routes.auth.setPassword
    : routes.portal;
  const next = safeNext(searchParams.get("next") ?? undefined, fallback);
  const failure = `${siteUrl(routes.auth.loginNext(next))}&error=auth`;

  if (searchParams.has("error")) return NextResponse.redirect(failure);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(siteUrl(next));
    }
    return NextResponse.redirect(failure);
  }

  if (tokenHash && type && EMAIL_TYPES.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    return NextResponse.redirect(error ? failure : siteUrl(next));
  }

  // Browsers retain the original #fragment across a redirect whose Location
  // has no fragment. Tokens never enter server logs or query parameters.
  return NextResponse.redirect(
    siteUrl(`/auth/complete?next=${encodeURIComponent(next)}`),
  );
}
