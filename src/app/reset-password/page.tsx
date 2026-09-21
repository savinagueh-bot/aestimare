"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { Btn, Field, inputCls } from "@/components/ui";
import { localUpdatePassword } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [supabaseRecovery, setSupabaseRecovery] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const type = hash.get("type") ?? params.get("type");

    async function boot() {
      if (token) {
        const res = await fetch("/api/auth/verify-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = (await res.json()) as { ok?: boolean; email?: string; error?: string };
        if (!json.ok || !json.email) {
          setError(json.error ?? "This reset link is invalid or expired.");
        } else {
          setEmail(json.email);
        }
        setReady(true);
        return;
      }
      if (type === "recovery") {
        setSupabaseRecovery(true);
        setReady(true);
        return;
      }
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb.auth.getSession();
        if (data.session) {
          setSupabaseRecovery(true);
          setEmail(data.session.user.email ?? "");
          setReady(true);
          return;
        }
      }
      setError("This reset link is missing or expired. Request a new one.");
      setReady(true);
    }
    void boot();
  }, []);

  async function submit() {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const local = email ? await localUpdatePassword(email, password) : { ok: true as const };
    const sb = getSupabase();
    if (sb && (supabaseRecovery || email)) {
      const { error: sbErr } = await sb.auth.updateUser({ password });
      if (sbErr && supabaseRecovery) {
        setBusy(false);
        setError(sbErr.message);
        return;
      }
    }
    if (!local.ok && !supabaseRecovery) {
      setBusy(false);
      setError(local.error);
      return;
    }
    setBusy(false);
    router.replace("/login");
  }

  return (
    <AuthFrame
      title="Set a new password"
      subtitle={email ? `Account: ${email}` : "Choose a new password for your Aestimare login."}
      footer={
        <a href="/login" className="font-semibold text-amber-400 hover:text-amber-300">
          Back to sign in
        </a>
      }
    >
      {!ready ? (
        <p className="text-sm text-slate-400">Checking reset link…</p>
      ) : error && !email && !supabaseRecovery ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Field label="New password">
            <input className={inputCls} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field>
          <Field label="Confirm password">
            <input className={inputCls} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </Field>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <Btn type="submit" className="mt-1 w-full" disabled={busy || !password || !confirm}>
            {busy ? "Saving…" : "Update password"}
          </Btn>
        </form>
      )}
    </AuthFrame>
  );
}
