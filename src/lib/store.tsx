"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  AppState,
  CableRun,
  Client,
  Estimate,
  Invoice,
  Lead,
  LeadStatus,
  PriceBookItem,
  Project,
  Task,
  User,
} from "./types";
import { SEED, TASK_TEMPLATES } from "./seed";
import { addDaysISO, todayISO, uid } from "./format";
import { estimateTotals } from "./calc";

const KEY = "aestimare.v1";

type Store = AppState & {
  ready: boolean;
  currentUser: User;
  setUser: (id: string) => void;
  resetDemo: () => void;
  upsertLead: (lead: Partial<Lead> & { id?: string }) => string;
  setLeadStatus: (id: string, status: LeadStatus) => void;
  upsertClient: (client: Partial<Client> & { id?: string }) => string;
  upsertEstimate: (est: Estimate) => void;
  addPriceBookItemToEstimate: (estimateId: string, item: PriceBookItem, qty: number) => void;
  convertEstimateToProject: (estimateId: string) => string | null;
  acceptEstimate: (estimateId: string) => string | null;
  upsertProject: (p: Partial<Project> & { id: string }) => void;
  addTask: (projectId: string, title: string) => void;
  setTaskStatus: (taskId: string, status: Task["status"]) => void;
  addCableRun: (run: Omit<CableRun, "id">) => void;
  updateCableRun: (id: string, patch: Partial<CableRun>) => void;
  createInvoiceFromEstimate: (estimateId: string, kind: Invoice["kind"]) => string;
  createInvoiceFromProject: (projectId: string) => string;
  createInvoice: (input: {
    clientName: string;
    email?: string;
    siteAddress?: string;
    kind?: Invoice["kind"];
    description: string;
    amount: number;
    notes?: string;
    projectId?: string;
    estimateId?: string;
  }) => string;
  setInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  markInvoicePaid: (id: string, method?: "card" | "ach") => void;
  logHours: (projectId: string, technicianId: string, hours: number, notes?: string) => void;
  upsertPriceBook: (item: PriceBookItem) => void;
};

const Ctx = createContext<Store | null>(null);

function nextNumber(prefix: string, existing: string[]) {
  const nums = existing
    .map((n) => parseInt(n.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `${prefix}-${next}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(SEED);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as AppState);
    } catch {
      /* keep seed */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const api = useMemo<Store>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? state.users[0];

    return {
      ...state,
      ready,
      currentUser,
      setUser: (id) => setState((s) => ({ ...s, currentUserId: id })),
      resetDemo: () => {
        localStorage.removeItem(KEY);
        setState(SEED);
      },
      upsertLead: (lead) => {
        const id = lead.id ?? uid("l");
        setState((s) => {
          const existing = s.leads.find((l) => l.id === id);
          const next: Lead = {
            id,
            contactName: lead.contactName ?? existing?.contactName ?? "",
            company: lead.company ?? existing?.company,
            email: lead.email ?? existing?.email ?? "",
            phone: lead.phone ?? existing?.phone ?? "",
            siteAddress: lead.siteAddress ?? existing?.siteAddress ?? "",
            city: lead.city ?? existing?.city ?? "",
            state: lead.state ?? existing?.state ?? "IA",
            zip: lead.zip ?? existing?.zip ?? "",
            source: lead.source ?? existing?.source ?? "phone",
            status: lead.status ?? existing?.status ?? "new",
            jobTypes: lead.jobTypes ?? existing?.jobTypes ?? [],
            notes: lead.notes ?? existing?.notes ?? "",
            estimatedValue: lead.estimatedValue ?? existing?.estimatedValue ?? 0,
            surveyAt: lead.surveyAt ?? existing?.surveyAt,
            clientId: lead.clientId ?? existing?.clientId,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { ...s, leads: existing ? s.leads.map((l) => (l.id === id ? next : l)) : [next, ...s.leads] };
        });
        return id;
      },
      setLeadStatus: (id, status) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l)),
        })),
      upsertClient: (client) => {
        const id = client.id ?? uid("c");
        setState((s) => {
          const existing = s.clients.find((c) => c.id === id);
          const next: Client = {
            id,
            company: client.company ?? existing?.company,
            name: client.name ?? existing?.name ?? "",
            email: client.email ?? existing?.email ?? "",
            phone: client.phone ?? existing?.phone ?? "",
            billingAddress: client.billingAddress ?? existing?.billingAddress,
            notes: client.notes ?? existing?.notes,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
          };
          return { ...s, clients: existing ? s.clients.map((c) => (c.id === id ? next : c)) : [next, ...s.clients] };
        });
        return id;
      },
      upsertEstimate: (est) =>
        setState((s) => {
          const exists = s.estimates.some((e) => e.id === est.id);
          return { ...s, estimates: exists ? s.estimates.map((e) => (e.id === est.id ? est : e)) : [est, ...s.estimates] };
        }),
      addPriceBookItemToEstimate: (estimateId, item, qty) =>
        setState((s) => ({
          ...s,
          estimates: s.estimates.map((e) =>
            e.id !== estimateId
              ? e
              : {
                  ...e,
                  lineItems: [
                    ...e.lineItems,
                    {
                      id: uid("eli"),
                      priceBookId: item.id,
                      category: item.category,
                      description: item.name,
                      qty,
                      unit: item.unit,
                      unitCost: item.unitCost,
                      markupPct: item.markupPct,
                      laborHours: item.laborHoursPerUnit,
                      laborRate: s.laborRateDefault,
                    },
                  ],
                }
          ),
        })),
      convertEstimateToProject: (estimateId) => {
        let created: string | null = null;
        setState((s) => {
          const est = s.estimates.find((e) => e.id === estimateId);
          if (!est) return s;
          const id = uid("p");
          created = id;
          const job = est.jobTypes[0] ?? "structured_cabling";
          const titles = TASK_TEMPLATES[job] ?? TASK_TEMPLATES.default;
          const tasks: Task[] = titles.map((title, i) => ({
            id: uid("t"),
            projectId: id,
            title,
            status: "pending",
            sort: i + 1,
          }));
          const project: Project = {
            id,
            number: nextNumber("PRJ", s.projects.map((p) => p.number)),
            name: `${est.company || est.clientName} — ${est.jobTypes.join(", ") || "install"}`,
            clientId: est.clientId,
            estimateId: est.id,
            leadId: est.leadId,
            siteAddress: est.siteAddress,
            siteContact: est.clientName,
            sitePhone: est.phone,
            status: "planned",
            jobTypes: est.jobTypes,
            startDate: todayISO(),
            targetDate: addDaysISO(14),
            assignedTechIds: [],
            scope: est.notes,
            createdAt: new Date().toISOString(),
          };
          return {
            ...s,
            estimates: s.estimates.map((e) => (e.id === estimateId ? { ...e, status: "accepted", acceptedAt: new Date().toISOString() } : e)),
            leads: s.leads.map((l) => (l.id === est.leadId ? { ...l, status: "won", updatedAt: new Date().toISOString() } : l)),
            projects: [project, ...s.projects],
            tasks: [...tasks, ...s.tasks],
          };
        });
        return created;
      },
      acceptEstimate: (estimateId) => {
        setState((s) => {
          const est = s.estimates.find((e) => e.id === estimateId);
          if (!est) return s;
          return {
            ...s,
            estimates: s.estimates.map((e) =>
              e.id === estimateId ? { ...e, status: "accepted", acceptedAt: new Date().toISOString() } : e
            ),
          };
        });
        return null;
      },
      upsertProject: (p) =>
        setState((s) => ({
          ...s,
          projects: s.projects.map((x) => (x.id === p.id ? { ...x, ...p } : x)),
        })),
      addTask: (projectId, title) =>
        setState((s) => {
          const sort = s.tasks.filter((t) => t.projectId === projectId).length + 1;
          return {
            ...s,
            tasks: [...s.tasks, { id: uid("t"), projectId, title, status: "pending", sort }],
          };
        }),
      setTaskStatus: (taskId, status) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        })),
      addCableRun: (run) =>
        setState((s) => ({ ...s, cableRuns: [...s.cableRuns, { ...run, id: uid("cr") }] })),
      updateCableRun: (id, patch) =>
        setState((s) => ({
          ...s,
          cableRuns: s.cableRuns.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      createInvoiceFromEstimate: (estimateId, kind) => {
        const id = uid("inv");
        setState((s) => {
          const est = s.estimates.find((e) => e.id === estimateId);
          if (!est) return s;
          const totals = estimateTotals(est);
          const amount = kind === "deposit" ? totals.deposit : totals.total;
          const inv: Invoice = {
            id,
            number: nextNumber("INV", s.invoices.map((i) => i.number)),
            estimateId,
            clientName: est.company ? `${est.company} c/o ${est.clientName}` : est.clientName,
            email: est.email,
            siteAddress: est.siteAddress,
            kind,
            status: "draft",
            taxRate: 0,
            notes: kind === "deposit" ? `${est.depositPct}% deposit on ${est.number}` : `Invoice for ${est.number}`,
            dueDate: addDaysISO(14),
            issuedAt: new Date().toISOString(),
            lineItems: [
              {
                id: uid("ili"),
                description: kind === "deposit" ? `Deposit — ${est.number}` : `Balance — ${est.number}`,
                qty: 1,
                unitPrice: Math.round(amount * 100) / 100,
              },
            ],
          };
          return { ...s, invoices: [inv, ...s.invoices] };
        });
        return id;
      },
      createInvoiceFromProject: (projectId) => {
        const id = uid("inv");
        setState((s) => {
          const p = s.projects.find((x) => x.id === projectId);
          if (!p) return s;
          const est = s.estimates.find((e) => e.id === p.estimateId);
          const totals = est ? estimateTotals(est) : { total: 0 };
          const inv: Invoice = {
            id,
            number: nextNumber("INV", s.invoices.map((i) => i.number)),
            projectId,
            estimateId: p.estimateId,
            clientName: p.siteContact,
            email: est?.email ?? "",
            siteAddress: p.siteAddress,
            kind: "final",
            status: "draft",
            taxRate: est?.taxRate ?? s.taxRateDefault,
            notes: `Final invoice — ${p.number}`,
            dueDate: addDaysISO(14),
            issuedAt: new Date().toISOString(),
            lineItems: est
              ? est.lineItems.map((li) => ({
                  id: uid("ili"),
                  description: li.description,
                  qty: li.qty,
                  unitPrice: li.unitCost * (1 + li.markupPct / 100) + li.laborHours * li.laborRate,
                }))
              : [{ id: uid("ili"), description: p.name, qty: 1, unitPrice: totals.total }],
          };
          return { ...s, invoices: [inv, ...s.invoices] };
        });
        return id;
      },
      createInvoice: (input) => {
        const id = uid("inv");
        setState((s) => {
          const inv: Invoice = {
            id,
            number: nextNumber("INV", s.invoices.map((i) => i.number)),
            projectId: input.projectId,
            estimateId: input.estimateId,
            clientName: input.clientName,
            email: input.email ?? "",
            siteAddress: input.siteAddress ?? "",
            kind: input.kind ?? "single",
            status: "draft",
            taxRate: s.taxRateDefault,
            notes: input.notes ?? "",
            dueDate: addDaysISO(14),
            issuedAt: new Date().toISOString(),
            lineItems: [
              {
                id: uid("ili"),
                description: input.description,
                qty: 1,
                unitPrice: Math.round(input.amount * 100) / 100,
              },
            ],
          };
          return { ...s, invoices: [inv, ...s.invoices] };
        });
        return id;
      },
      setInvoiceStatus: (id, status) =>
        setState((s) => ({
          ...s,
          invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      markInvoicePaid: (id, method = "card") =>
        setState((s) => {
          const inv = s.invoices.find((i) => i.id === id);
          if (!inv) return s;
          const amount = inv.lineItems.reduce((n, l) => n + l.qty * l.unitPrice, 0) * (1 + inv.taxRate / 100);
          return {
            ...s,
            invoices: s.invoices.map((i) =>
              i.id === id ? { ...i, status: "paid", paidAt: new Date().toISOString() } : i
            ),
            payments: [
              {
                id: uid("pay"),
                invoiceId: id,
                amount,
                method,
                receivedAt: new Date().toISOString(),
                reference: "demo_stripe",
              },
              ...s.payments,
            ],
          };
        }),
      logHours: (projectId, technicianId, hours, notes) =>
        setState((s) => ({
          ...s,
          timeEntries: [
            { id: uid("te"), projectId, technicianId, hours, date: todayISO(), notes },
            ...s.timeEntries,
          ],
        })),
      upsertPriceBook: (item) =>
        setState((s) => {
          const exists = s.priceBook.some((p) => p.id === item.id);
          return {
            ...s,
            priceBook: exists ? s.priceBook.map((p) => (p.id === item.id ? item : p)) : [item, ...s.priceBook],
          };
        }),
    };
  }, [state, ready]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
