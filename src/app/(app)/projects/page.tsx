"use client";

import { Badge, Card, PageHeader, projTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { JOB_TYPE_LABEL, PROJECT_STATUS_LABEL, fmtDate } from "@/lib/format";

export default function ProjectsPage() {
  const { projects, tasks, users } = useStore();
  return (
    <div>
      <PageHeader title="Projects" subtitle="Jobs converted from estimates or opened directly." />
      <div className="grid gap-3">
        {projects.map((p) => {
          const pts = tasks.filter((t) => t.projectId === p.id);
          const done = pts.filter((t) => t.status === "done").length;
          const techs = users.filter((u) => p.assignedTechIds.includes(u.id));
          return (
            <a key={p.id} href={`/projects/${p.id}`}>
              <Card className="p-4 hover:border-amber-300">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">{p.number}</div>
                    <h2 className="text-lg font-semibold">{p.name}</h2>
                    <p className="text-sm text-slate-500">{p.siteAddress}</p>
                  </div>
                  <Badge tone={projTone(p.status)}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.jobTypes.map((j) => (
                    <Badge key={j}>{JOB_TYPE_LABEL[j]}</Badge>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                  <span>
                    {done}/{pts.length} tasks · {techs.map((t) => t.name.split(" ")[0]).join(", ") || "Unassigned"}
                  </span>
                  <span>
                    {fmtDate(p.startDate)} → {fmtDate(p.targetDate)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${pts.length ? (done / pts.length) * 100 : 0}%` }}
                  />
                </div>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
