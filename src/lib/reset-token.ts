import { createHmac } from "crypto";

function secret() {
  return process.env.RESEND_API_KEY || process.env.RESET_TOKEN_SECRET || "aestimare-dev-reset";
}

export function signResetToken(email: string, exp = Date.now() + 60 * 60 * 1000) {
  const payload = `${email.toLowerCase()}|${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ email: email.toLowerCase(), exp, sig })).toString("base64url");
}

export function verifyResetToken(token: string) {
  try {
    const raw = JSON.parse(Buffer.from(token, "base64url").toString()) as {
      email?: string;
      exp?: number;
      sig?: string;
    };
    if (!raw.email || !raw.exp || !raw.sig) return null;
    if (Date.now() > raw.exp) return null;
    const expected = createHmac("sha256", secret()).update(`${raw.email}|${raw.exp}`).digest("hex");
    if (expected !== raw.sig) return null;
    return raw.email;
  } catch {
    return null;
  }
}
