/**
 * Turn anything thrown into something a log line can carry.
 *
 * Split out of report.ts, which is `server-only` and therefore not loadable
 * by the test runner — this is the part with the actual decisions in it, and
 * it had a bug worth pinning down: Supabase hands back a plain
 * `PostgrestError`, not an `Error`, so every reported database failure was
 * being stringified to "[object Object]" and losing the only field that said
 * what went wrong.
 */
export type SerialisedError = {
  name: string;
  message: string;
  stack: string | null;
};

export function serialise(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack ?? null };
  }

  // Supabase hands back a plain `PostgrestError`, not an Error instance, so
  // `String(err)` on it produced "[object Object]" — throwing away the one
  // field that says what went wrong. Every reported database failure was
  // arriving in the logs as that string.
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    if (typeof e.message === "string") {
      // PostgREST sometimes repeats the message in `details`; printing it
      // twice makes every log line look like a bug in the logger.
      const parts = [e.message];
      if (typeof e.details === "string" && e.details && e.details !== e.message) {
        parts.push(e.details);
      }
      if (typeof e.hint === "string" && e.hint) parts.push(`hint: ${e.hint}`);
      return {
        name: typeof e.code === "string" ? e.code : "ObjectError",
        message: parts.join(" — "),
        stack: null,
      };
    }
    try {
      return { name: "ObjectError", message: JSON.stringify(err), stack: null };
    } catch {
      // Circular; fall through to String().
    }
  }

  return { name: "NonError", message: String(err), stack: null };
}
