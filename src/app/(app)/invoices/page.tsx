"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Btn, Card, Field, PageHeader, inputCls, invTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { invoiceTotals } from "@/lib/calc";
import { INVOICE_STATUS_LABEL, fmtDate, money } from "@/lib/format";
import type { InvoiceKind } from "@/lib/types";

export default function InvoicesPage() {
  const store = useStore();
  const { invoices, clients, projects } = store;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    email: "",
    siteAddress: "",
    kind: "single" as InvoiceKind,
    description: "",
    amount: "",
    notes: "",
    projectId: "",
  });

  function create() {
    const amount = Number(form.amount);
    if (!form.clientName.trim() || !form.description.trim() || !Number.isFinite(amount) || amount <= 0) return;
    const id = store.createInvoice({
      clientName: form.clientName.trim(),
      email: form.email.trim(),
      siteAddress: form.siteAddress.trim(),
      kind: form.kind,
      description: form.description.trim(),
      amount,
      notes: form.notes.trim(),
      projectId: form.projectId || undefined,
    });
    setOpen(false);
    router.push(`/invoices/${id}`);
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Create a bill from scratch, or from a project later."
        actions={<Btn onClick={() => setOpen(true)}>New invoice</Btn>}
      />

      {open ? (
        <Card className="mb-4 p-4">
          <h2 className="mb-3 font-semibold">New invoice</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Bill to">
              <input
                className={inputCls}
                list="invoice-clients"
                value={form.clientName}
                onChange={(e) => {
                  const name = e.target.value;
                  const match = clients.find((c) => c.name === name || c.company === name);
                  setForm({
                    ...form,
                    clientName: name,
                    email: match?.email || form.email,
                  });
                }}
                required
              />
              <datalist id="invoice-clients">
                {clients.map((c) => (
                  <option key={c.id} value={c.company || c.name} />
                ))}
              </datalist>
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Site / address">
              <input className={inputCls} value={form.siteAddress} onChange={(e) => setForm({ ...form, siteAddress: e.target.value })} />
            </Field>
            <Field label="Type">
              <select className={inputCls} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as InvoiceKind })}>
                <option value="single">Single</option>
                <option value="deposit">Deposit</option>
                <option value="progress">Progress</option>
                <option value="final">Final</option>
              </select>
            </Field>
            <Field label="Line description">
              <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Cat6 drops — 24 stations" />
            </Field>
            <Field label="Amount (USD)">
              <input className={inputCls} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <Field label="Link project (optional)">
              <select className={inputCls} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.number} — {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notes">
              <input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <Btn onClick={create} disabled={!form.clientName || !form.description || !form.amount}>
              Create invoice
            </Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
          </div>
        </Card>
      ) : null}

      <Card>
        {invoices.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No invoices yet. Click <span className="font-semibold text-slate-700">New invoice</span> to bill a customer.
          </div>
        ) : (
          invoices.map((inv) => {
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
          })
        )}
      </Card>
    </div>
  );
}
