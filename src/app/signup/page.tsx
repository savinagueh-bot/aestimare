"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { Btn, Field, inputCls } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const { session, signUp } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "office" as Role,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  async function submit() {
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const result = await signUp({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.href = form.role === "technician" ? "/field" : "/dashboard";
  }

  return (
    <AuthFrame
      title="Create an account"
      subtitle="New office or field users can join the Iowa Structured Cabling workspace."
      footer={
        <>
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-amber-400 hover:text-amber-300">
            Sign in
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
        <Field label="Full name">
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Work email">
          <input className={inputCls} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </Field>
        <Field label="Phone">
          <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Role">
          <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            <option value="office">Office</option>
            <option value="technician">Technician</option>
            <option value="owner">Owner</option>
          </select>
        </Field>
        <Field label="Password">
          <input className={inputCls} type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </Field>
        <Field label="Confirm password">
          <input className={inputCls} type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
        </Field>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <Btn type="submit" className="mt-1 w-full" disabled={busy || !form.name || !form.email || !form.password}>
          {busy ? "Creating account…" : "Create account"}
        </Btn>
      </form>
    </AuthFrame>
  );
}
