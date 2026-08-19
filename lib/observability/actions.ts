"use server";

import { reportError } from "@/lib/observability/report";

/**
 * The browser's way into the server-side reporter, used by the error
 * boundaries. Deliberately narrow: a message, the digest Next already showed
 * the visitor, and the path. No stack from the client, because a minified one
 * is noise and an unminified one is a map of the bundle.
 *
 * Anyone can call this — it's a server action on a public page. So it does
 * nothing but forward a bounded, typed payload to the same sink, and treats
 * every field as untrusted text.
 */
export async function reportClientError(input: {
  message: string;
  digest?: string;
  path?: string;
}): Promise<void> {
  reportError(new Error(input.message.slice(0, 500)), {
    source: "client-boundary",
    digest: input.digest?.slice(0, 100) ?? null,
    path: input.path?.slice(0, 200) ?? null,
  });
}
