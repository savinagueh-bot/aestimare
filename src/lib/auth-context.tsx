"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Role, User } from "./types";
import { useStore } from "./store";
import {
  ensureDemoAccounts,
  localSignIn,
  localSignUp,
  readSession,
  supabaseSignIn,
  supabaseSignOut,
  supabaseSignUp,
  writeSession,
  type Session,
} from "./auth";
import { isSupabaseConfigured } from "./supabase";
import { uid } from "./format";

type AuthApi = {
  ready: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  enterAs: (user: User) => void;
};

const AuthCtx = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!store.ready) return;
    void ensureDemoAccounts(store.users);
  }, [store.ready, store.users]);

  const api = useMemo<AuthApi>(
    () => ({
      ready: ready && store.ready,
      session,
      enterAs: (user) => {
        const next = { userId: user.id, email: user.email, name: user.name, role: user.role };
        writeSession(next);
        setSession(next);
        store.setUser(user.id);
      },
      signIn: async (email, password) => {
        await ensureDemoAccounts(store.users);
        if (isSupabaseConfigured()) {
          const remote = await supabaseSignIn(email, password);
          if (remote.ok) {
            const existing = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
            if (existing) {
              const next = { userId: existing.id, email: existing.email, name: existing.name, role: existing.role };
              writeSession(next);
              setSession(next);
              store.setUser(existing.id);
              return { ok: true as const };
            }
          }
        }
        const local = await localSignIn(email, password);
        if (!local.ok) return local;
        setSession(local.session);
        store.setUser(local.session.userId);
        return { ok: true as const };
      },
      signUp: async (input) => {
        const email = input.email.trim().toLowerCase();
        if (store.users.some((u) => u.email.toLowerCase() === email)) {
          return { ok: false as const, error: "An account with that email already exists." };
        }
        const id = uid("u");
        if (isSupabaseConfigured()) {
          await supabaseSignUp({ ...input, email });
        }
        const local = await localSignUp({ ...input, email, userId: id });
        if (!local.ok) return local;
        const user: User = {
          id,
          name: input.name.trim(),
          email,
          role: input.role,
          phone: input.phone,
        };
        store.setUser(id);
        setSession(local.session);
        try {
          const raw = localStorage.getItem("aestimare.v1");
          const parsed = raw ? JSON.parse(raw) : {};
          const users = Array.isArray(parsed.users) ? parsed.users : store.users;
          if (!users.some((u: User) => u.id === id)) {
            localStorage.setItem(
              "aestimare.v1",
              JSON.stringify({ ...parsed, users: [...users, user], currentUserId: id })
            );
          }
        } catch {
          /* ignore */
        }
        return { ok: true as const };
      },
      signOut: async () => {
        writeSession(null);
        setSession(null);
        await supabaseSignOut();
      },
    }),
    [ready, session, store]
  );

  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
