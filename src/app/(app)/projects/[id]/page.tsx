"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Btn, Card, Field, PageHeader, inputCls, projTone } from "@/components/ui";
import { useStore } from "@/lib/store";
import { PROJECT_STATUS_LABEL, fmtDate } from "@/lib/format";
import type { CableType, ProjectStatus, TaskStatus } from "@/lib/types";

const TASK_TONES: Record<TaskStatus, string> = {
  pending: "border-slate-200 bg-white",
  in_progress: "border-amber-300 bg-amber-50",
  blocked: "border-rose-300 bg-rose-50",
  done: "border-emerald-300 bg-emerald-50",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const project = store.projects.find((p) => p.id === id);
  const tasks = store.tasks.filter((t) => t.projectId === id).sort((a, b) => a.sort - b.sort);
  const runs = store.cableRuns.filter((r) => r.projectId === id);
  const hours = store.timeEntries.filter((t) => t.projectId === id);
  const [title, setTitle] = useState("");
  const [hrs, setHrs] = useState(1);
  const [run, setRun] = useState({
    runId: "",
    fromLoc: "",
    toLoc: "",
    cableType: "cat6" as CableType,
    lengthFt: 0,
  });

  if (!project) return <p>Project not found.</p>;

  const hidePrice = store.currentUser.role === "technician";

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={`${project.number} · ${project.siteAddress}`}
        actions={
          <>
            {!hidePrice ? (
              <Btn
                variant="secondary"
                onClick={() => {
                  const inv = store.createInvoiceFromProject(project.id);
                  router.push(`/invoices/${inv}`);
                }}
              >
                Generate invoice
              </Btn>
            ) : null}
            <select
              className={inputCls + " w-auto"}
              value={project.status}
              onChange={(e) => store.upsertProject({ id: project.id, status: e.target.value as ProjectStatus })}
            >
              {Object.entries(PROJECT_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={projTone(project.status)}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
        <Badge>Start {fmtDate(project.startDate)}</Badge>
        <Badge>Target {fmtDate(project.targetDate)}</Badge>
        <Badge>Contact {project.siteContact} {project.sitePhone}</Badge>
      </div>
      <p className="mb-6 max-w-3xl text-sm text-slate-600">{project.scope}</p>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-3">
          <h2 className="mb-3 font-semibold">Task checklist</h2>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 tap ${TASK_TONES[t.status]}`}>
                <button
                  className="h-6 w-6 shrink-0 rounded border border-slate-400 bg-white text-sm font-bold"
                  onClick={() =>
                    store.setTaskStatus(t.id, t.status === "done" ? "pending" : t.status === "pending" ? "in_progress" : "done")
                  }
                >
                  {t.status === "done" ? "✓" : t.status === "in_progress" ? "•" : ""}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={t.status === "done" ? "text-slate-500 line-through" : "font-medium"}>{t.title}</div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">{t.status.replace("_", " ")}</div>
                </div>
                <select
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                  value={t.status}
                  onChange={(e) => store.setTaskStatus(t.id, e.target.value as TaskStatus)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input className={inputCls} placeholder="Add task" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Btn
              onClick={() => {
                if (!title.trim()) return;
                store.addTask(project.id, title.trim());
                setTitle("");
              }}
            >
              Add
            </Btn>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Hours</h2>
          <ul className="mb-3 space-y-1 text-sm">
            {hours.map((h) => {
              const tech = store.users.find((u) => u.id === h.technicianId);
              return (
                <li key={h.id} className="flex justify-between">
                  <span>
                    {h.date} · {tech?.name.split(" ")[0]}
                  </span>
                  <span className="font-medium">{h.hours}h</span>
                </li>
              );
            })}
            {hours.length === 0 ? <li className="text-slate-500">No hours logged.</li> : null}
          </ul>
          <div className="flex gap-2">
            <input type="number" className={inputCls + " w-24"} value={hrs} onChange={(e) => setHrs(Number(e.target.value))} />
            <Btn onClick={() => store.logHours(project.id, store.currentUser.id, hrs, "Field log")}>Log hours</Btn>
          </div>
          <p className="mt-2 text-xs text-slate-500">Total {hours.reduce((s, h) => s + h.hours, 0)} h</p>
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <h2 className="mb-3 font-semibold">Cable / drop tracker</h2>
        <div className="mb-3 grid gap-2 sm:grid-cols-5">
          <Field label="Run ID">
            <input className={inputCls} value={run.runId} onChange={(e) => setRun({ ...run, runId: e.target.value })} placeholder="W-04" />
          </Field>
          <Field label="From">
            <input className={inputCls} value={run.fromLoc} onChange={(e) => setRun({ ...run, fromLoc: e.target.value })} />
          </Field>
          <Field label="To">
            <input className={inputCls} value={run.toLoc} onChange={(e) => setRun({ ...run, toLoc: e.target.value })} />
          </Field>
          <Field label="Type">
            <select className={inputCls} value={run.cableType} onChange={(e) => setRun({ ...run, cableType: e.target.value as CableType })}>
              <option value="cat6">Cat6</option>
              <option value="cat6a">Cat6A</option>
              <option value="os2">OS2</option>
              <option value="om3">OM3</option>
              <option value="om4">OM4</option>
            </select>
          </Field>
          <Field label="Length (ft)">
            <input type="number" className={inputCls} value={run.lengthFt} onChange={(e) => setRun({ ...run, lengthFt: Number(e.target.value) })} />
          </Field>
        </div>
        <Btn
          variant="ghost"
          onClick={() => {
            if (!run.runId) return;
            store.addCableRun({
              projectId: project.id,
              ...run,
              terminated: false,
              labeled: false,
              testResult: "pending",
            });
            setRun({ runId: "", fromLoc: "", toLoc: "", cableType: "cat6", lengthFt: 0 });
          }}
        >
          Add run
        </Btn>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">ID</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Ft</th>
                <th>Term</th>
                <th>Label</th>
                <th>Test</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{r.runId}</td>
                  <td>{r.fromLoc}</td>
                  <td>{r.toLoc}</td>
                  <td className="uppercase">{r.cableType}</td>
                  <td>{r.lengthFt}</td>
                  <td>
                    <input type="checkbox" checked={r.terminated} onChange={(e) => store.updateCableRun(r.id, { terminated: e.target.checked })} />
                  </td>
                  <td>
                    <input type="checkbox" checked={r.labeled} onChange={(e) => store.updateCableRun(r.id, { labeled: e.target.checked })} />
                  </td>
                  <td>
                    <select
                      className="rounded border border-slate-200 px-1 py-1 text-xs"
                      value={r.testResult ?? "pending"}
                      onChange={(e) => store.updateCableRun(r.id, { testResult: e.target.value as "pass" | "fail" | "pending" })}
                    >
                      <option value="pending">Pending</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
