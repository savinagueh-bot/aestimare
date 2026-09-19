"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { ready, session } = useStore();

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? "/dashboard" : "/login");
  }, [ready, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
      Opening Aestimare…
    </div>
  );
}
