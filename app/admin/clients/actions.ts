"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isValidSlug, routes, siteUrl, slugify } from "@/lib/routes";
import { caseStudies } from "@/lib/client-content";
import type { ClientStatus, ClientTier } from "@/lib/supabase/types";

export type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

/**
 * Admin guard for actions that run with the caller's own credentials. RLS
 * would refuse a non-admin anyway; this turns that into a readable message
 * instead of an empty result.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, ok: profile?.role === "admin" };
}

/** Suggest a slug from the company/name as the admin types. */
export async function suggestSlug(input: string): Promise<ActionResult<string>> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  const base = slugify(input);
  if (!base) return { ok: true, data: "" };

  // Walk suffixes until one is free, exactly as the 0008 backfill did.
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    if (!isValidSlug(candidate)) continue;
    const { data } = await supabase.rpc("slug_available", {
      p_slug: candidate,
    });
    if (data) return { ok: true, data: candidate };
  }
  return { ok: true, data: "" };
}

export async function createClientRecord(input: {
  name: string;
  company: string;
  email: string;
  slug: string;
  tier: ClientTier;
  status: ClientStatus;
}): Promise<ActionResult<{ id: string; slug: string }>> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim();
  const slug = input.slug.trim().toLowerCase();

  if (!name) return { ok: false, error: "Name is required." };
  if (!email.includes("@")) return { ok: false, error: "A valid email is required." };
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      error:
        "Slug must be lowercase letters, numbers and hyphens (2–48 chars), and not a reserved word.",
    };
  }

  const { data: free } = await supabase.rpc("slug_available", { p_slug: slug });
  if (!free) return { ok: false, error: `The slug "${slug}" is already taken.` };

  // client_private and client_pages rows are created by the
  // clients_provision_records trigger — nothing to do here.
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      company: company || null,
      email,
      slug,
      tier: input.tier,
      status: input.status,
    })
    .select("id, slug")
    .single();

  if (error) {
    // 23505 is the unique violation on slug or email.
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "A client with that slug or email already exists." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(routes.admin.clients, "layout");
  return { ok: true, data: data as { id: string; slug: string } };
}

export async function updateClientRecord(
  clientId: string,
  input: {
    name: string;
    company: string;
    email: string;
    slug: string;
    tier: ClientTier;
    status: ClientStatus;
  },
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  const slug = input.slug.trim().toLowerCase();
  if (!isValidSlug(slug)) return { ok: false, error: "Invalid slug." };

  const { data: free } = await supabase.rpc("slug_available", {
    p_slug: slug,
    p_except: clientId,
  });
  if (!free) return { ok: false, error: `The slug "${slug}" is already taken.` };

  const { error } = await supabase
    .from("clients")
    .update({
      name: input.name.trim(),
      company: input.company.trim() || null,
      email: input.email.trim().toLowerCase(),
      slug,
      tier: input.tier,
      status: input.status,
    })
    .eq("id", clientId);
  if (error) return { ok: false, error: error.message };

  await supabase.rpc("log_admin_action", {
    p_action: "client_updated",
    p_client_id: clientId,
    p_detail: { slug },
  });

  revalidatePath(routes.admin.client(clientId), "layout");
  revalidatePath(routes.admin.clients, "layout");
  revalidatePath(routes.client.root(slug), "layout");
  return { ok: true };
}

/** Private admin notes — stored in client_private, never readable by the client. */
export async function saveClientNotes(
  clientId: string,
  notes: string,
  tags: string[],
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  const { error } = await supabase.from("client_private").upsert({
    client_id: clientId,
    notes: notes.trim() || null,
    tags: tags.map((t) => t.trim()).filter(Boolean),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(routes.admin.client(clientId), "layout");
  return { ok: true };
}

/**
 * The public pitch page at /c/{slug}. `case_studies` holds slugs from
 * lib/client-content.ts; unknown ones are rejected here rather than silently
 * dropped at render time, which is what used to happen when a case study was
 * renamed out from under a published page.
 */
export async function savePitchPage(
  clientId: string,
  slug: string,
  input: {
    displayName: string;
    headline: string;
    note: string;
    caseStudies: string[];
    services: string[];
    published: boolean;
  },
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  const displayName = input.displayName.trim();
  if (!displayName) return { ok: false, error: "Display name is required." };

  const known = new Set(caseStudies.map((cs) => cs.slug));
  const unknown = input.caseStudies.filter((s) => !known.has(s));
  if (unknown.length > 0) {
    return { ok: false, error: `Unknown case studies: ${unknown.join(", ")}.` };
  }

  if (input.published && input.caseStudies.length === 0 && !input.note.trim()) {
    return {
      ok: false,
      error: "Add a note or at least one case study before publishing.",
    };
  }

  const { error } = await supabase.from("client_pages").upsert({
    client_id: clientId,
    display_name: displayName,
    headline: input.headline.trim() || null,
    note: input.note.trim(),
    case_studies: input.caseStudies,
    services: input.services.map((s) => s.trim()).filter(Boolean),
    published: input.published,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.rpc("log_admin_action", {
    p_action: input.published ? "pitch_published" : "pitch_saved",
    p_client_id: clientId,
    p_detail: { case_studies: input.caseStudies },
  });

  revalidatePath(routes.admin.client(clientId), "layout");
  revalidatePath(routes.client.root(slug), "layout");
  return { ok: true };
}

/**
 * Invite the client to their space. Supabase emails them a link; the callback
 * exchanges it for a session and drops them on /set-password, after which
 * /portal forwards them to /c/{slug}.
 *
 * Uses the service client: creating auth users and writing profiles is
 * privileged, and the role claim must be set server-side so it can't be
 * chosen by whoever signs up.
 */
export async function inviteClientUser(
  clientId: string,
): Promise<ActionResult<string>> {
  const { ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not configured." };
  }

  const admin = createServiceClient();
  const { data: client } = await admin
    .from("clients")
    .select("id, email, name, slug")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) return { ok: false, error: "Client not found." };

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(client.email, {
      redirectTo: siteUrl(
        `/auth/callback?next=${encodeURIComponent(routes.auth.setPassword)}`,
      ),
      data: { full_name: client.name },
    });

  if (inviteError || !invited?.user) {
    return {
      ok: false,
      error: inviteError?.message ?? "Could not send the invite.",
    };
  }

  // The claim middleware reads, and the profile row RLS reads. Both are set
  // here so the invited user is never briefly unscoped.
  await admin.auth.admin.updateUserById(invited.user.id, {
    app_metadata: { role: "client" },
  });

  const { error: profileError } = await admin.from("profiles").upsert({
    id: invited.user.id,
    role: "client",
    client_id: client.id,
    full_name: client.name,
  });
  if (profileError) return { ok: false, error: profileError.message };

  await admin.from("audit_log").insert({
    client_id: client.id,
    action: "client_invited",
    detail: { email: client.email },
  });

  revalidatePath(routes.admin.client(clientId), "layout");
  return { ok: true, data: client.email };
}
