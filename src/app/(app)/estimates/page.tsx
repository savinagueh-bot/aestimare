"use client";

import { useRouter } from "next/navigation";
import { Badge, Btn, Card, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { estimateTotals } from "@/lib/calc";
import { ESTIMATE_STATUS_LABEL, addDaysISO, money, todayISO, uid } from "@/lib/format";
import type { Estimate } from "@/lib/types";

const tone: Record<string, "slate" | "amber" | "green" | "red" | "blue" | "violet"> = {
  draft: "slate",
  sent: "amber",
  viewed: "blue",
  accepted: "green",
  declined: "red",
  expired: "red",
};

export default function EstimatesPage() {
  const { estimates, upsertEstimate, taxRateDefault, laborRateDefault } = useStore();
  const router = useRouter();

  function create() {
    const id = uid("e");
    const est: Estimate = {
      id,
      number: `EST-${Math.floor(1000 + Math.random() * 8000)}`,
      clientName: "",
      email: "",
      phone: "",
      siteAddress: "",
      jobTypes: [],
      status: "draft",
      lineItems: [],
      taxRate: taxRateDefault,
      depositPct: 50,
      notes: "",
      validUntil: addDaysISO(30),
      createdAt: new Date().toISOString(),
    };
    upsertEstimate(est);
    router.push(`/estimates/${id}`);
  }

  return (
    <div>
      <PageHeader
        title="Estimates"
        subtitle="Price book line items, margin, tax, deposit. Convert to a project when the client accepts."
        actions={<Btn onClick={create}>New estimate</Btn>}
      />
      <Card>
        <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
          <div className="col-span-2">Number</div>
          <div className="col-span-3">Client</div>
          <div className="col-span-3">Site</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-1 text-right">Margin</div>
          <div className="col-span-1 text-right"> </div>
        </div>
        {estimates.map((e) => {
          const t = estimateTotals(e);
          return (
            <a
              key={e.id}
              href={`/estimates/${e.id}`}
              className="grid grid-cols-1 gap-1 border-b border-slate-100 px-4 py-3 text-sm last:border-0 hover:bg-slate-50 sm:grid-cols-12 sm:items-center"
            >
              <div className="col-span-2 font-semibold">{e.number}</div>
              <div className="col-span-3 truncate">{e.company || e.clientName || "Untitled"}</div>
              <div className="col-span-3 truncate text-slate-500">{e.siteAddress || "—"}</div>
              <div className="col-span-1">
                <Badge tone={tone[e.status]}>{ESTIMATE_STATUS_LABEL[e.status]}</Badge>
              </div>
              <div className="col-span-1 text-right font-medium">{money(t.total)}</div>
              <div className="col-span-1 text-right text-slate-500">{t.margin.toFixed(0)}%</div>
              <div className="col-span-1 text-right text-amber-700">Open</div>
            </a>
          );
        })}
        {estimates.length === 0 ? <p className="p-6 text-sm text-slate-500">No estimates yet.</p> : null}
      </Card>
      <p className="mt-3 hidden text-xs text-slate-400">{todayISO()} default labor ${laborRateDefault}/hr</p>
    </div>
  );
}
