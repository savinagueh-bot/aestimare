import type { Estimate, EstimateLineItem, Invoice } from "./types";

export function sellPrice(unitCost: number, markupPct: number) {
  return unitCost * (1 + markupPct / 100);
}

export function lineMaterial(item: EstimateLineItem) {
  return sellPrice(item.unitCost, item.markupPct) * item.qty;
}

export function lineLabor(item: EstimateLineItem) {
  return item.laborHours * item.laborRate * item.qty;
}

export function lineTotal(item: EstimateLineItem) {
  return lineMaterial(item) + lineLabor(item);
}

export function estimateTotals(est: Estimate) {
  const material = est.lineItems.reduce((s, i) => s + lineMaterial(i), 0);
  const labor = est.lineItems.reduce((s, i) => s + lineLabor(i), 0);
  const cost = est.lineItems.reduce(
    (s, i) => s + i.unitCost * i.qty + i.laborHours * i.laborRate * i.qty,
    0
  );
  const subtotal = material + labor;
  const tax = subtotal * (est.taxRate / 100);
  const total = subtotal + tax;
  const margin = total === 0 ? 0 : ((subtotal - cost) / subtotal) * 100;
  const deposit = total * (est.depositPct / 100);
  return { material, labor, cost, subtotal, tax, total, margin, deposit };
}

export function invoiceTotals(inv: Invoice) {
  const subtotal = inv.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = subtotal * (inv.taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}
