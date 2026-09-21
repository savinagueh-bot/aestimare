"use client";

import type { Role, User } from "./types";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export const SESSION_KEY = "aestimare.session.v1";
export const ACCOUNTS_KEY = "aestimare.accounts.v1";
export const DEMO_PASSWORD = "IowaCabling1!";

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

type Account = {
  userId: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  passwordHash: string;
};

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hashPassword(password: string) {
  return sha256(`aestimare:${password.trim()}`);
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.userId || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function ensureDemoAccounts(users: User[]) {
  const existing = readAccounts();
  const demoHash = await hashPassword(DEMO_PASSWORD);
  const byEmail = new Map(existing.map((a) => [a.email.toLowerCase(), a]));
  for (const user of users) {
    const key = user.email.toLowerCase();
    if (!byEmail.has(key)) {
      byEmail.set(key, {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        passwordHash: demoHash,
      });
    }
  }
  const next = Array.from(byEmail.values());
  if (next.length !== existing.length) writeAccounts(next);
  return next;
}

export async function localSignUp(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  userId: string;
}) {
  const accounts = readAccounts();
  const email = input.email.trim().toLowerCase();
  if (accounts.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false as const, error: "An account with that email already exists." };
  }
  const account: Account = {
    userId: input.userId,
    email,
    name: input.name.trim(),
    role: input.role,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
  };
  writeAccounts([...accounts, account]);
  const session: Session = { userId: account.userId, email: account.email, name: account.name, role: account.role };
  writeSession(session);
  return { ok: true as const, session };
}

export async function localUpdatePassword(email: string, password: string) {
  const accounts = readAccounts();
  const key = email.trim().toLowerCase();
  const match = accounts.find((a) => a.email.toLowerCase() === key);
  if (!match) return { ok: false as const, error: "No account found for that email." };
  match.passwordHash = await hashPassword(password);
  writeAccounts(accounts.map((a) => (a.email.toLowerCase() === key ? match : a)));
  return { ok: true as const };
}

export async function localSignIn(email: string, password: string) {
  const accounts = readAccounts();
  const match = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!match) return { ok: false as const, error: "No account found for that email." };
  const hash = await hashPassword(password);
  if (hash !== match.passwordHash) return { ok: false as const, error: "Incorrect password." };
  const session: Session = { userId: match.userId, email: match.email, name: match.name, role: match.role };
  writeSession(session);
  return { ok: true as const, session };
}

export async function supabaseSignUp(input: { email: string; password: string; name: string; role: Role; phone?: string }) {
  const sb = getSupabase();
  if (!sb) return { ok: false as const, error: "Supabase is not configured." };
  const { data, error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { name: input.name, role: input.role, phone: input.phone ?? "" } },
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, userId: data.user?.id ?? null };
}

export async function supabaseSignIn(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) return { ok: false as const, error: "Supabase is not configured." };
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, userId: data.user?.id ?? null, email: data.user?.email ?? email };
}

export async function supabaseSignOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

export { isSupabaseConfigured };
