"use client";

import { useState } from "react";
import { Btn, Card, Field, inputCls } from "@/components/ui";
import { useStore } from "@/lib/store";
import { JOB_TYPE_LABEL } from "@/lib/format";
import type { JobType } from "@/lib/types";

export default function IntakePage() {
  const { upsertLead } = useStore();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    contactName: "",
    company: "",
    email: "",
    phone: "",
    siteAddress: "",
    city: "",
    state: "IA",
    zip: "",
    notes: "",
    jobTypes: [] as JobType[],
  });

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Card className="max-w-md p-6 text-center">
          <h1 className="text-xl font-bold">Request received</h1>
          <p className="mt-2 text-sm text-slate-600">
            Iowa Structured Cabling will contact you shortly. For emergencies call 651-551-1174.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <Card className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold">Request a site survey / estimate</h1>
        <p className="mt-1 text-sm text-slate-500">Iowa Structured Cabling — Des Moines metro and statewide Iowa.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name">
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
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(JOB_TYPE_LABEL) as JobType[]).map((j) => {
            const on = form.jobTypes.includes(j);
            return (
              <button
                key={j}
                type="button"
                onClick={() =>
                  setForm({ ...form, jobTypes: on ? form.jobTypes.filter((x) => x !== j) : [...form.jobTypes, j] })
                }
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${on ? "border-amber-600 bg-amber-50" : "border-slate-200"}`}
              >
                {JOB_TYPE_LABEL[j]}
              </button>
            );
          })}
        </div>
        <textarea
          className={inputCls + " mt-3 min-h-24"}
          placeholder="Tell us about the job"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <Btn
          className="mt-4 w-full"
          disabled={!form.contactName}
          onClick={() => {
            upsertLead({ ...form, source: "website", status: "new", estimatedValue: 0 });
            setDone(true);
          }}
        >
          Send request
        </Btn>
      </Card>
    </div>
  );
}
