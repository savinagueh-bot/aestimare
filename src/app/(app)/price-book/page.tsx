"use client";

import { useState } from "react";
import { Btn, Card, Field, PageHeader, inputCls } from "@/components/ui";
import { useStore } from "@/lib/store";
import { money, uid } from "@/lib/format";
import { sellPrice } from "@/lib/calc";
import type { PriceBookItem } from "@/lib/types";

export default function PriceBookPage() {
  const { priceBook, upsertPriceBook, laborRateDefault } = useStore();
  const [draft, setDraft] = useState<PriceBookItem>({
    id: uid("pb"),
    sku: "",
    category: "Hardware",
    name: "",
    unit: "ea",
    unitCost: 0,
    markupPct: 40,
    laborHoursPerUnit: 0,
    taxable: true,
    active: true,
  });

  return (
    <div>
      <PageHeader title="Price book" subtitle="Unit cost, markup, and labor hours per unit. Estimates pull from here." />
      <Card className="mb-4 p-4">
        <div className="grid gap-2 sm:grid-cols-6">
          <Field label="SKU">
            <input className={inputCls} value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
          </Field>
          <Field label="Name">
            <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <input className={inputCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          </Field>
          <Field label="Cost">
            <input type="number" step="0.01" className={inputCls} value={draft.unitCost} onChange={(e) => setDraft({ ...draft, unitCost: Number(e.target.value) })} />
          </Field>
          <Field label="Markup %">
            <input type="number" className={inputCls} value={draft.markupPct} onChange={(e) => setDraft({ ...draft, markupPct: Number(e.target.value) })} />
          </Field>
          <Field label="Hrs / unit">
            <input type="number" step="0.05" className={inputCls} value={draft.laborHoursPerUnit} onChange={(e) => setDraft({ ...draft, laborHoursPerUnit: Number(e.target.value) })} />
          </Field>
        </div>
        <Btn
          className="mt-3"
          onClick={() => {
            if (!draft.name) return;
            upsertPriceBook(draft);
            setDraft({ ...draft, id: uid("pb"), sku: "", name: "", unitCost: 0 });
          }}
        >
          Add item
        </Btn>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2 text-right">Cost</th>
              <th className="px-3 py-2 text-right">Mk%</th>
              <th className="px-3 py-2 text-right">Sell</th>
              <th className="px-3 py-2 text-right">Hrs</th>
              <th className="px-3 py-2 text-right">Labor $</th>
            </tr>
          </thead>
          <tbody>
            {priceBook.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.category}</div>
                </td>
                <td className="px-3 py-2">{p.unit}</td>
                <td className="px-3 py-2 text-right">{money(p.unitCost)}</td>
                <td className="px-3 py-2 text-right">{p.markupPct}%</td>
                <td className="px-3 py-2 text-right font-medium">{money(sellPrice(p.unitCost, p.markupPct))}</td>
                <td className="px-3 py-2 text-right">{p.laborHoursPerUnit}</td>
                <td className="px-3 py-2 text-right">{money(p.laborHoursPerUnit * laborRateDefault)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
