import { NextResponse } from "next/server";
import { verifyResetToken } from "@/lib/reset-token";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string };
  const email = body.token ? verifyResetToken(body.token) : null;
  if (!email) {
    return NextResponse.json({ ok: false, error: "This reset link is invalid or expired." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, email });
}
