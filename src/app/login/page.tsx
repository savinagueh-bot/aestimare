"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { Btn, Field, inputCls } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { DEMO_PASSWORD } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { users } = useStore();
  const { session, signIn, enterAs } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  async function submit() {
    setError("");
    setBusy(true);
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <AuthFrame
      title="Sign in"
      subtitle="Use your Aestimare account to open the workspace."
      footer={
        <>
          New to the team?{" "}
          <a href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
            Create an account
          </a>
        </>
      }
    >
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field label="Email">
          <input className={inputCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <input className={inputCls} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <Btn type="submit" className="mt-1 w-full" disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </Btn>
      </form>
      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Demo workspace</p>
        <p className="mb-3 text-xs text-slate-400">
          Seeded staff password is <span className="font-mono text-slate-200">{DEMO_PASSWORD}</span>
        </p>
        <div className="grid gap-2">
          {users.slice(0, 4).map((u) => (
            <button
              key={u.id}
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10"
              onClick={() => {
                setEmail(u.email);
                setPassword(DEMO_PASSWORD);
              }}
            >
              Fill {u.name} — {u.role}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 text-xs text-slate-500 underline"
          onClick={() => {
            const owner = users.find((u) => u.role === "owner") ?? users[0];
            if (owner) {
              enterAs(owner);
              window.location.href = "/dashboard";
            }
          }}
        >
          Skip to demo as owner
        </button>
      </div>
    </AuthFrame>
  );
}
