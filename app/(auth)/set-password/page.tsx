import { SetPasswordForm } from "./SetPasswordForm";

export const metadata = { title: "Set your password — Shaft OS" };

/**
 * Landing page for the admin-issued invite link. Supabase establishes a
 * session from the invite token (via /auth/callback), then the client sets
 * their own password here.
 */
export default function SetPasswordPage() {
  return <SetPasswordForm />;
}
