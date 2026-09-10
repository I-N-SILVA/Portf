"use client";

import { signOut } from "@/app/(auth)/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="os-chip" title="Sign out" aria-label="Sign out">
        ⏻
      </button>
    </form>
  );
}
