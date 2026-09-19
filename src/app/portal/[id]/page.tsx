"use client";

import { useParams } from "next/navigation";
import { Btn, Card } from "@/components/ui";
import { useStore } from "@/lib/store";
import { invoiceTotals } from "@/lib/calc";
import { money } from "@/lib/format";

export default function PortalPayPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const inv = store.invoices.find((i) => i.id === id);
  if (!inv) return <div className="p-8">Invoice not found.</div>;
  const t = invoiceTotals(inv);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Iowa Structured Cabling</div>
        <h1 className="mt-1 text-2xl font-bold">Pay {inv.number}</h1>
        <p className="mt-1 text-sm text-slate-500">{inv.clientName}</p>
        <p className="mt-4 text-3xl font-bold">{money(t.total)}</p>
        <p className="text-sm text-slate-500">{inv.notes}</p>
        {inv.status === "paid" ? (
          <p className="mt-6 font-semibold text-emerald-700">Paid. Thank you.</p>
        ) : (
          <div className="mt-6 space-y-2">
            <Btn className="w-full" onClick={() => store.markInvoicePaid(inv.id, "card")}>
              Pay with card (Stripe demo)
            </Btn>
            <Btn className="w-full" variant="secondary" onClick={() => store.markInvoicePaid(inv.id, "ach")}>
              Pay with ACH (Stripe demo)
            </Btn>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Production replaces these buttons with Stripe Checkout or a Payment Link. Saved cards and ACH mandates live on
          the Stripe customer.
        </p>
      </Card>
    </div>
  );
}
