"use client";

import { Cable } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn } from "@/components/ui";

export default function Home() {
  const { users, setUser } = useStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
          <Cable />
        </div>
        <div>
          <div className="text-2xl font-bold">Aestimare</div>
          <div className="text-sm text-slate-400">Project management for low-voltage contractors</div>
        </div>
      </div>
      <p className="mb-8 max-w-md text-center text-slate-300">
        Demo workspace for Iowa Structured Cabling. Pick a role to enter — data lives in this browser until you connect
        Supabase.
      </p>
      <div className="grid w-full max-w-lg gap-2">
        {users.map((u) => (
          <Btn
            key={u.id}
            variant={u.role === "owner" ? "primary" : "ghost"}
            className={u.role !== "owner" ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : ""}
            onClick={() => {
              setUser(u.id);
              window.location.href = u.role === "technician" ? "/field" : "/dashboard";
            }}
          >
            Continue as {u.name} — {u.role}
          </Btn>
        ))}
      </div>
    </div>
  );
}
