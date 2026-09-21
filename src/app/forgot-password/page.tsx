"use client";

import { useState } from "react";
import { AuthFrame } from "@/components/AuthFrame";
import { Btn, Field, inputCls } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok && !json.ok) {
        setError(json.error ?? "Could not send the reset email.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Could not send the reset email.");
    }
    setBusy(false);
  }

  return (
    <AuthFrame
      title="Forgot password"
      subtitle="We'll email a reset link if that address has an Aestimare account."
      footer={
        <a href="/login" className="font-semibold text-amber-400 hover:text-amber-300">
          Back to sign in
        </a>
      }
    >
      {done ? (
        <p className="text-sm text-slate-200">
          Check {email || "your inbox"} for a reset link. It expires in one hour. Also look in spam.
        </p>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Field label="Email">
            <input
              className={inputCls}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <Btn type="submit" className="mt-1 w-full" disabled={busy || !email}>
            {busy ? "Sending…" : "Send reset link"}
          </Btn>
        </form>
      )}
    </AuthFrame>
  );
}
