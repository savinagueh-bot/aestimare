"use client";

import { useParams } from "next/navigation";
import { Badge, Btn, Card, PageHeader, invTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { invoiceTotals } from "@/lib/calc";
import { INVOICE_STATUS_LABEL, fmtDate, money } from "@/lib/format";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const inv = store.invoices.find((i) => i.id === id);
  if (!inv) return <p>Invoice not found.</p>;
  const t = invoiceTotals(inv);
  const pays = store.payments.filter((p) => p.invoiceId === inv.id);

  return (
    <div>
      <PageHeader
        title={inv.number}
        subtitle={`${inv.kind} invoice · ${inv.clientName}`}
        actions={
          <>
            {inv.status === "draft" ? (
              <Btn variant="ghost" onClick={() => store.setInvoiceStatus(inv.id, "sent")}>
                Mark sent
              </Btn>
            ) : null}
            {inv.status !== "paid" ? (
              <Btn onClick={() => store.markInvoicePaid(inv.id, "card")}>Record Stripe payment</Btn>
            ) : null}
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bill to</div>
              <div className="font-semibold">{inv.clientName}</div>
              <div className="text-sm text-slate-500">{inv.email}</div>
              <div className="text-sm text-slate-500">{inv.siteAddress}</div>
            </div>
            <Badge tone={invTone(inv.status)}>{INVOICE_STATUS_LABEL[inv.status]}</Badge>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.lineItems.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-2">{l.description}</td>
                  <td className="py-2 text-right">{l.qty}</td>
                  <td className="py-2 text-right">{money(l.unitPrice)}</td>
                  <td className="py-2 text-right">{money(l.qty * l.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-4 ml-auto w-56 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(t.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax {inv.taxRate}%</dt>
              <dd>{money(t.tax)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{money(t.total)}</dd>
            </div>
          </dl>
          {inv.notes ? <p className="mt-6 text-sm text-slate-600">{inv.notes}</p> : null}
        </Card>
        <div className="space-y-3">
          <Card className="p-4">
            <h2 className="mb-2 font-semibold">Collection</h2>
            <p className="text-sm text-slate-500">Issued {fmtDate(inv.issuedAt)}</p>
            <p className="text-sm text-slate-500">Due {fmtDate(inv.dueDate)}</p>
            {inv.paidAt ? <p className="text-sm text-emerald-700">Paid {fmtDate(inv.paidAt)}</p> : null}
            <Btn className="mt-3 w-full" variant="secondary" href={`/portal/${inv.id}`}>
              Open payment link
            </Btn>
            <p className="mt-2 text-xs text-slate-500">
              Live Stripe Checkout + ACH attach here. Demo link marks the invoice paid when the client confirms.
            </p>
          </Card>
          <Card className="p-4">
            <h2 className="mb-2 font-semibold">Payments</h2>
            {pays.length === 0 ? <p className="text-sm text-slate-500">None yet.</p> : null}
            {pays.map((p) => (
              <div key={p.id} className="text-sm">
                {money(p.amount)} · {p.method} · {fmtDate(p.receivedAt)}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
