"use client";

import { useParams, useRouter } from "next/navigation";
import { Btn, Card } from "@/components/ui";
import { useStore } from "@/lib/store";
import { estimateTotals, lineTotal } from "@/lib/calc";
import { money, fmtDate } from "@/lib/format";
import { Cable } from "lucide-react";

export default function AcceptEstimatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const est = store.estimates.find((e) => e.id === id);

  if (!est) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p>Estimate not found in this browser workspace.</p>
      </div>
    );
  }

  const t = estimateTotals(est);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <Cable size={18} />
          </div>
          <div>
            <div className="text-sm font-bold">Iowa Structured Cabling</div>
            <div className="text-xs text-slate-500">Estimate {est.number}</div>
          </div>
        </div>
        <Card className="p-6">
          <h1 className="text-2xl font-bold">Estimate for {est.company || est.clientName}</h1>
          <p className="mt-1 text-sm text-slate-500">{est.siteAddress}</p>
          <p className="text-sm text-slate-500">Valid through {fmtDate(est.validUntil)}</p>
          {est.notes ? <p className="mt-4 text-sm text-slate-700">{est.notes}</p> : null}
          <table className="mt-6 w-full text-sm">
            <thead className="border-b text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {est.lineItems.map((li) => (
                <tr key={li.id} className="border-b border-slate-100">
                  <td className="py-2">{li.description}</td>
                  <td className="py-2 text-right">
                    {li.qty} {li.unit}
                  </td>
                  <td className="py-2 text-right">{money(lineTotal(li))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(t.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>{money(t.tax)}</dd>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <dt>Total</dt>
              <dd>{money(t.total)}</dd>
            </div>
            <div className="flex justify-between text-amber-800">
              <dt>{est.depositPct}% deposit to schedule</dt>
              <dd className="font-semibold">{money(t.deposit)}</dd>
            </div>
          </dl>
          {est.status === "accepted" ? (
            <p className="mt-6 font-semibold text-emerald-700">Accepted. We will be in touch to schedule.</p>
          ) : (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Btn
                className="flex-1"
                onClick={() => {
                  store.convertEstimateToProject(est.id);
                  router.refresh();
                }}
              >
                Accept & e-sign
              </Btn>
              <Btn
                className="flex-1"
                variant="ghost"
                onClick={() => store.upsertEstimate({ ...est, status: "declined" })}
              >
                Decline
              </Btn>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Acceptance is an electronic signature under Iowa and federal ESIGN rules for this demo. Production will
            capture typed name + timestamp + IP.
          </p>
        </Card>
      </div>
    </div>
  );
}
