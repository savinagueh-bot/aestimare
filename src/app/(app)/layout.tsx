"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { useStore } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, session } = useStore();

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading workspace…</div>;
  }
  if (!session) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Redirecting to sign in…</div>;
  }

  return <Shell>{children}</Shell>;
}
