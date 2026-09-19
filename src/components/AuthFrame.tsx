"use client";

import type { ReactNode } from "react";
import { Cable } from "lucide-react";

export function AuthFrame({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
            <Cable />
          </div>
          <div>
            <div className="text-2xl font-bold">Aestimare</div>
            <div className="text-sm text-slate-400">Iowa Structured Cabling</div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </div>
        {footer ? <div className="mt-4 text-center text-sm text-slate-400">{footer}</div> : null}
      </div>
    </div>
  );
}
