import "@/components/os/os-theme.css";

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
  return (
    <div className="shaft-os">
      <div className="os-paper" />
      <div className="os-auth">{children}</div>
    </div>
  );
}
