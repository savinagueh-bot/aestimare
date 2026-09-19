"use client";

import { Badge, Card, PageHeader, invTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { invoiceTotals } from "@/lib/calc";
import { INVOICE_STATUS_LABEL, fmtDate, money } from "@/lib/format";

export default function InvoicesPage() {
  const { invoices } = useStore();
  return (
    <div>
      <PageHeader title="Invoices" subtitle="Deposit, progress, and final billing. Stripe payment is simulated in demo mode." />
      <Card>
        {invoices.map((inv) => {
          const t = invoiceTotals(inv);
          return (
            <a
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
            >
              <div>
                <div className="font-semibold">{inv.number}</div>
                <div className="text-sm text-slate-500">
                  {inv.clientName} · {inv.kind} · due {fmtDate(inv.dueDate)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{money(t.total)}</div>
                <Badge tone={invTone(inv.status)}>{INVOICE_STATUS_LABEL[inv.status]}</Badge>
              </div>
            </a>
          );
        })}
      </Card>
    </div>
  );
}
