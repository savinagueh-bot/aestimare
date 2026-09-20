"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { Btn, Field, inputCls } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { session, signIn } = useAuth();
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
      footer={
        <>
          New user?{" "}
          <a href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
            Create an account
          </a>
        </>
      }
    >
      {!isSupabaseConfigured() ? (
        <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.
        </p>
      ) : null}
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
    </AuthFrame>
  );
}
