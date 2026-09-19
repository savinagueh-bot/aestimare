"use client";

import { useState } from "react";
import { Btn, Card, Field, PageHeader, inputCls } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ClientsPage() {
  const { clients, leads, projects, invoices, upsertClient } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", billingAddress: "" });

  return (
    <div>
      <PageHeader title="Clients" subtitle="Reusable records. Leads can attach to a client to avoid duplicates." actions={<Btn onClick={() => setOpen(true)}>New client</Btn>} />
      <div className="grid gap-3 md:grid-cols-2">
        {clients.map((c) => {
          const lCount = leads.filter((l) => l.clientId === c.id).length;
          const pCount = projects.filter((p) => p.clientId === c.id).length;
          const iCount = invoices.filter((i) => i.email === c.email).length;
          return (
            <Card key={c.id} className="p-4">
              <div className="font-semibold">{c.company || c.name}</div>
              {c.company ? <div className="text-sm text-slate-600">{c.name}</div> : null}
              <div className="mt-1 text-sm text-slate-500">
                {c.email} · {c.phone}
              </div>
              {c.billingAddress ? <div className="mt-1 text-sm text-slate-500">{c.billingAddress}</div> : null}
              <div className="mt-3 text-xs text-slate-500">
                {lCount} leads · {pCount} projects · {iCount} invoices
              </div>
            </Card>
          );
        })}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center sm:p-4">
          <Card className="w-full max-w-md p-5">
            <h2 className="mb-3 text-lg font-bold">New client</h2>
            <div className="grid gap-3">
              <Field label="Name">
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Company">
                <input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </Field>
              <Field label="Email">
                <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Billing address">
                <input className={inputCls} value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Btn>
              <Btn
                onClick={() => {
                  upsertClient(form);
                  setOpen(false);
                }}
              >
                Save
              </Btn>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
