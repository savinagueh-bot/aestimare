"use client";

import { Badge, Btn, Card, PageHeader, projTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { PROJECT_STATUS_LABEL, todayISO } from "@/lib/format";

export default function FieldPage() {
  const store = useStore();
  const techId = store.currentUser.id;
  const mine = store.projects.filter(
    (p) => p.assignedTechIds.includes(techId) || store.currentUser.role !== "technician"
  );
  const today = todayISO();

  return (
    <div>
      <PageHeader title="Today in the field" subtitle="Large targets. Tap a task done. Log hours." />
      <p className="mb-4 text-sm text-slate-500">Signed in as {store.currentUser.name} · {today}</p>
      <div className="space-y-4">
        {mine.map((p) => {
          const tasks = store.tasks.filter((t) => t.projectId === p.id).sort((a, b) => a.sort - b.sort);
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-slate-500">{p.number}</div>
                  <h2 className="text-lg font-bold leading-snug">{p.name}</h2>
                  <p className="text-sm text-slate-600">{p.siteAddress}</p>
                </div>
                <Badge tone={projTone(p.status)}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
              </div>
              <ul className="mt-4 space-y-2">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => store.setTaskStatus(t.id, t.status === "done" ? "pending" : "done")}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${
                        t.status === "done" ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${
                        t.status === "done" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400"
                      }`}>
                        {t.status === "done" ? "✓" : ""}
                      </span>
                      <span className={t.status === "done" ? "text-slate-500 line-through" : "font-medium"}>{t.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn variant="secondary" onClick={() => store.logHours(p.id, store.currentUser.id, 1)}>+1 hour</Btn>
                <Btn variant="ghost" href={`/projects/${p.id}`}>Job details</Btn>
              </div>
            </Card>
          );
        })}
        {mine.length === 0 ? <p className="text-sm text-slate-500">No jobs assigned.</p> : null}
      </div>
    </div>
  );
}
