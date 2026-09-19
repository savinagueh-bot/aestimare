"use client";

import Link from "next/link";
import { Badge, Card, PageHeader, invTone, leadTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { estimateTotals, invoiceTotals } from "@/lib/calc";
import { INVOICE_STATUS_LABEL, JOB_TYPE_LABEL, LEAD_STATUS_LABEL, money } from "@/lib/format";

export default function DashboardPage() {
  const { leads, estimates, projects, invoices } = useStore();
  const pipeline = leads.filter((l) => !["won", "lost"].includes(l.status)).reduce((s, l) => s + l.estimatedValue, 0);
  const jobs = projects.filter((p) => p.status === "in_progress" || p.status === "planned");
  const unpaid = invoices.filter((i) => !["paid", "void"].includes(i.status));
  const unpaidAmt = unpaid.reduce((s, i) => s + invoiceTotals(i).total, 0);

  return (
    <div>
      <PageHeader title="Owner dashboard" subtitle="Pipeline, work in the field, and cash sitting in invoices." />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open pipeline</div>
          <div className="mt-1 text-2xl font-bold">{money(pipeline)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jobs active</div>
          <div className="mt-1 text-2xl font-bold">{jobs.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">AR outstanding</div>
          <div className="mt-1 text-2xl font-bold">{money(unpaidAmt)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimates</div>
          <div className="mt-1 text-2xl font-bold">{estimates.length}</div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Lead pipeline</h2>
            <Link href="/leads" className="text-sm font-medium text-amber-700">Open board</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {leads.slice(0, 6).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate font-medium">{l.company || l.contactName}</div>
                  <div className="truncate text-xs text-slate-500">{l.jobTypes.map((j) => JOB_TYPE_LABEL[j]).join(" · ")} · {l.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{money(l.estimatedValue)}</div>
                  <Badge tone={leadTone(l.status)}>{LEAD_STATUS_LABEL[l.status]}</Badge>
                </div>
              </li>
            ))}
            {leads.length === 0 ? <li className="py-3 text-sm text-slate-500">No leads yet.</li> : null}
          </ul>
        </Card>
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Invoices</h2>
            <Link href="/invoices" className="text-sm font-medium text-amber-700">All invoices</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {invoices.slice(0, 6).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <div className="font-medium">{i.number}</div>
                  <div className="text-xs text-slate-500">{i.clientName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{money(invoiceTotals(i).total)}</div>
                  <Badge tone={invTone(i.status)}>{INVOICE_STATUS_LABEL[i.status]}</Badge>
                </div>
              </li>
            ))}
            {invoices.length === 0 ? <li className="py-3 text-sm text-slate-500">No invoices yet.</li> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
