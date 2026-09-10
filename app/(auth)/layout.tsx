import "@/components/os/os-theme.css";
import { supabaseConfigured } from "@/lib/env";
import { NotConfigured } from "@/components/os/NotConfigured";

// These pages construct a Supabase browser client during render. Force
// dynamic rendering so Next.js never tries to prerender them at build time —
// otherwise a build without Supabase env vars configured (e.g. a preview
// deploy with no secrets yet) crashes instead of just deferring to runtime.
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Without credentials the forms below construct a Supabase browser client
  // and throw. Every other area of the app degrades to a plain explanation in
  // that state — /admin says what's missing, /c/{slug} falls back to the
  // sample pitch rooms — and this was the one that still returned a 500.
  if (!supabaseConfigured()) {
    return (
      <div className="shaft-os">
        <div className="os-paper" />
        <NotConfigured area="sign in" />
      </div>
    );
  }

  return (
    <div className="shaft-os">
      <div className="os-paper" />
      <div className="os-auth">{children}</div>
    </div>
  );
}
