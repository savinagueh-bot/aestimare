"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Btn, Card, Field, PageHeader, inputCls, leadTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { JOB_TYPE_LABEL, LEAD_STATUS_LABEL, money, uid } from "@/lib/format";
import type { JobType, LeadSource, LeadStatus } from "@/lib/types";

const COLS: LeadStatus[] = ["new", "contacted", "survey_scheduled", "estimate_sent", "won", "lost"];

export default function LeadsPage() {
  const { leads, upsertLead, setLeadStatus, estimates } = useStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Website, phone, referral, and bid-portal intake. Drag is a click: change status on the card."
        actions={<Btn onClick={() => setOpen(true)}>New lead</Btn>}
      />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLS.map((col) => {
          const items = leads.filter((l) => l.status === col);
          const value = items.reduce((s, l) => s + l.estimatedValue, 0);
          return (
            <div key={col} className="w-72 shrink-0">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">{LEAD_STATUS_LABEL[col]}</h2>
                <span className="text-xs text-slate-500">
                  {items.length} · {money(value)}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((l) => {
                  const est = estimates.find((e) => e.leadId === l.id);
                  return (
                    <Card key={l.id} className="p-3">
                      <div className="font-semibold leading-snug">{l.company || l.contactName}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {l.contactName} · {l.city}, {l.state}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {l.jobTypes.map((j) => (
                          <Badge key={j} tone="slate">
                            {JOB_TYPE_LABEL[j]}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-semibold">{money(l.estimatedValue)}</span>
                        <Badge tone={leadTone(l.status)}>{l.source.replace("_", " ")}</Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">{l.notes}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {COLS.filter((c) => c !== l.status)
                          .slice(0, 3)
                          .map((c) => (
                            <button
                              key={c}
                              className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                              onClick={() => setLeadStatus(l.id, c)}
                            >
                              {LEAD_STATUS_LABEL[c]}
                            </button>
                          ))}
                      </div>
                      {est ? (
                        <Btn href={`/estimates/${est.id}`} variant="ghost" className="mt-2 w-full text-xs">
                          Open {est.number}
                        </Btn>
                      ) : (
                        <Btn
                          variant="ghost"
                          className="mt-2 w-full text-xs"
                          onClick={() => {
                            const id = uid("e");
                            sessionStorage.setItem("aestimare.newLead", l.id);
                            router.push(`/estimates/${id}`);
                          }}
                        >
                          Build estimate
                        </Btn>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {open ? <LeadModal onClose={() => setOpen(false)} onSave={upsertLead} /> : null}
    </div>
  );
}

function LeadModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: ReturnType<typeof useStore>["upsertLead"];
}) {
  const [form, setForm] = useState({
    contactName: "",
    company: "",
    email: "",
    phone: "",
    siteAddress: "",
    city: "",
    state: "IA",
    zip: "",
    source: "phone" as LeadSource,
    estimatedValue: 0,
    notes: "",
    jobTypes: [] as JobType[],
  });

  const jobs = useMemo(() => Object.keys(JOB_TYPE_LABEL) as JobType[], []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <Card className="max-h-[92vh] w-full max-w-lg overflow-y-auto p-5">
        <h2 className="mb-4 text-lg font-bold">New lead</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contact">
            <input className={inputCls} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
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
          <Field label="Site address">
            <input className={inputCls} value={form.siteAddress} onChange={(e) => setForm({ ...form, siteAddress: e.target.value })} />
          </Field>
          <Field label="City">
            <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="State">
            <input className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </Field>
          <Field label="ZIP">
            <input className={inputCls} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </Field>
          <Field label="Source">
            <select className={inputCls} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}>
              <option value="website">Website form</option>
              <option value="phone">Phone</option>
              <option value="referral">Referral</option>
              <option value="bid_portal">Bid portal</option>
              <option value="walk_in">Walk-in</option>
              <option value="repeat">Repeat client</option>
            </select>
          </Field>
          <Field label="Est. value">
            <input
              type="number"
              className={inputCls}
              value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Job types</div>
          <div className="flex flex-wrap gap-1.5">
            {jobs.map((j) => {
              const on = form.jobTypes.includes(j);
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      jobTypes: on ? form.jobTypes.filter((x) => x !== j) : [...form.jobTypes, j],
                    })
                  }
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${on ? "border-amber-600 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600"}`}
                >
                  {JOB_TYPE_LABEL[j]}
                </button>
              );
            })}
          </div>
        </div>
        <Field label="Notes">
          <textarea className={inputCls + " mt-3 min-h-20"} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            onClick={() => {
              onSave({ ...form, status: "new" });
              onClose();
            }}
            disabled={!form.contactName}
          >
            Save lead
          </Btn>
        </div>
      </Card>
    </div>
  );
}
