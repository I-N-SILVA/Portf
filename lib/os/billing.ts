import { createClient } from "@/lib/supabase/server";
import type { Invoice, Subscription } from "@/lib/supabase/types";

export {
  isInvoiceOverdue,
  billingSummary,
  formatMoney,
} from "./billing-utils";

export type ClientBilling = {
  subscription: Subscription | null;
  invoices: Invoice[];
};

/** Subscription + invoices for one client (see getProjectsForClient). */
export async function getBillingForClient(clientId: string): Promise<ClientBilling> {
  const supabase = await createClient();
  const [{ data: subs }, { data: invoices }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("invoices")
      .select("*")
      .eq("client_id", clientId)
      .neq("status", "draft")
      .order("created_at", { ascending: false }),
  ]);
  return {
    subscription: ((subs ?? []) as Subscription[])[0] ?? null,
    invoices: (invoices ?? []) as Invoice[],
  };
}
