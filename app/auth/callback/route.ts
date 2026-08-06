import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routes, safeNext } from "@/lib/routes";

/**
 * OAuth / magic-link / invite / recovery callback. Supabase redirects here
 * with a `code`; we exchange it for a session, then forward the user on.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next") ?? undefined);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${routes.auth.login}?error=auth`);
}
