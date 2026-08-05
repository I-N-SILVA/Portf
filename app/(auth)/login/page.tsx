import { LoginForm } from "./LoginForm";
import { safeNext } from "@/lib/routes";

export const metadata = { title: "Sign in — Shaft OS" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  // "/portal" is the landing router: it forwards to /c/{slug} or /admin
  // depending on who just signed in.
  return <LoginForm next={safeNext(next)} initialError={error} />;
}
