"use client";

import { Btn, Card, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { resetDemo, currentUser, laborRateDefault, taxRateDefault } = useStore();
  return (
    <div>
      <PageHeader title="Settings" subtitle="Company defaults and demo workspace controls." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="font-semibold">Company</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div>Iowa Structured Cabling LLC</div>
            <div className="text-slate-500">2752 Holcomb Avenue, Des Moines, IA 50310</div>
            <div className="text-slate-500">651-551-1174 · Info@Iowacabling.com</div>
            <div className="text-slate-500">www.iowacabling.com</div>
          </dl>
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold">Defaults</h2>
          <p className="mt-2 text-sm">Labor rate ${laborRateDefault}/hr</p>
          <p className="text-sm">Tax rate {taxRateDefault}%</p>
          <p className="mt-2 text-sm text-slate-500">Signed in as {currentUser.name} ({currentUser.role}).</p>
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold">Demo data</h2>
          <p className="mt-2 text-sm text-slate-600">This browser keeps your edits in localStorage.</p>
          <Btn className="mt-3" variant="danger" onClick={() => { if (confirm("Reset demo workspace?")) resetDemo(); }}>
            Reset workspace
          </Btn>
        </Card>
      </div>
    </div>
  );
}
