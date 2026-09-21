import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signResetToken } from "@/lib/reset-token";

function appOrigin(req: Request) {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

async function postResend(key: string, from: string, to: string, link: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your Aestimare password",
      text: `Reset your Aestimare password using this link (valid for 1 hour):\n\n${link}\n\nIf you did not request this, ignore this email.\n\nIowa Structured Cabling LLC\n651-551-1174`,
      html: `<p>Reset your Aestimare password using this link (valid for 1 hour):</p><p><a href="${link}">${link}</a></p><p>If you did not request this, ignore this email.</p><p>Iowa Structured Cabling LLC<br/>651-551-1174</p>`,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { message?: string; name?: string };
  return { ok: res.ok, status: res.status, error: json.message ?? json.name };
}

async function sendResetEmail(to: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, error: "RESEND_API_KEY is not set on the server." };
  const branded = process.env.EMAIL_FROM ?? "Iowa Structured Cabling <Info@Iowacabling.com>";
  const first = await postResend(key, branded, to, link);
  if (first.ok) return { ok: true as const };
  const unverified = /not verified|domain/i.test(first.error ?? "");
  if (unverified) {
    const retry = await postResend(key, "Aestimare <beth.t@example.com>", to, link);
    if (retry.ok) return { ok: true as const };
    return {
      ok: false as const,
      error:
        retry.error ??
        "Resend will not send from iowacabling.com until that domain is verified. Add the domain at resend.com/domains.",
    };
  }
  return { ok: false as const, error: first.error ?? `Resend error ${first.status}` };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }
  const origin = appOrigin(req);
  const token = signResetToken(email);
  const link = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
  const mail = await sendResetEmail(email, link);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    try {
      const sb = createClient(url, anon);
      await sb.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
    } catch {
      /* Resend is the primary path */
    }
  }
  if (!mail.ok) {
    return NextResponse.json({ ok: false, error: mail.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: "If that email is on file, a reset link is on the way." });
}
