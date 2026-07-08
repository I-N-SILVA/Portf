"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import type { Client } from "@/lib/supabase/types";

export type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, ok: profile?.role === "admin" };
}

export async function createProject(
  clientId: string,
  name: string,
  description: string,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  if (!name.trim()) return { ok: false, error: "Give the project a name." };

  const { error } = await supabase.from("projects").insert({
    client_id: clientId,
    name: name.trim(),
    description: description.trim() || null,
    status: "in_progress",
  });
  if (error) return { ok: false, error: error.message };

  await supabase.rpc("log_admin_action", {
    p_action: "project_created",
    p_client_id: clientId,
    p_detail: { name: name.trim() },
  });

  revalidatePath(`/clients/${clientId}`, "layout");
  return { ok: true };
}

export async function addMilestone(
  clientId: string,
  projectId: string,
  name: string,
  dueDate: string,
  position: number,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  if (!name.trim()) return { ok: false, error: "Give the milestone a name." };

  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    name: name.trim(),
    due_date: dueDate || null,
    position,
    status: "in_progress",
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clients/${clientId}`, "layout");
  return { ok: true };
}

/**
 * Ensure the client has a Stripe customer, creating one on first use and
 * storing the id back on the client record.
 */
async function ensureStripeCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string,
): Promise<string> {
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();
  const client = data as Client | null;
  if (!client) throw new Error("Client not found.");
  if (client.stripe_customer_id) return client.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email: client.email,
    name: client.company ?? client.name,
    metadata: { client_id: clientId },
  });
  await supabase
    .from("clients")
    .update({ stripe_customer_id: customer.id })
    .eq("id", clientId);
  return customer.id;
}

/**
 * Create and finalise a one-off invoice in Stripe, then mirror it into
 * Supabase immediately (the webhook keeps it in sync thereafter). Amount is
 * accepted in major units (e.g. pounds) and stored in minor units.
 */
export async function createInvoice(
  clientId: string,
  amountMajor: number,
  description: string,
  dueDays: number,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }
  if (!description.trim()) {
    return { ok: false, error: "Add a description." };
  }

  const minor = Math.round(amountMajor * 100);

  try {
    const stripe = getStripe();
    const customerId = await ensureStripeCustomer(supabase, clientId);

    await stripe.invoiceItems.create({
      customer: customerId,
      amount: minor,
      currency: "gbp",
      description: description.trim(),
    });

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: Math.max(1, Math.floor(dueDays) || 7),
      description: description.trim(),
    });

    const finalised = invoice.id
      ? await stripe.invoices.finalizeInvoice(invoice.id)
      : invoice;

    await supabase.from("invoices").upsert(
      {
        client_id: clientId,
        stripe_invoice_id: finalised.id!,
        number: finalised.number ?? null,
        description: description.trim(),
        amount: finalised.total ?? minor,
        amount_paid: finalised.amount_paid ?? 0,
        currency: finalised.currency ?? "gbp",
        status: finalised.status ?? "open",
        due_date: finalised.due_date
          ? new Date(finalised.due_date * 1000).toISOString()
          : null,
        hosted_invoice_url: finalised.hosted_invoice_url ?? null,
      },
      { onConflict: "stripe_invoice_id" },
    );

    await supabase.rpc("log_admin_action", {
      p_action: "invoice_created",
      p_client_id: clientId,
      p_detail: { amount: minor, description: description.trim() },
    });

    revalidatePath(`/clients/${clientId}`, "layout");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error.";
    return { ok: false, error: message };
  }
}

/** Flag a milestone ready for review — client sees it, 48h nudge clock starts. */
export async function markMilestoneReady(
  clientId: string,
  milestoneId: string,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  const { error } = await supabase.rpc("mark_milestone_ready", {
    p_milestone_id: milestoneId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clients/${clientId}`, "layout");
  return { ok: true };
}
