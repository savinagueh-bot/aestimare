"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FolderKanban,
  FileText,
  BookOpen,
  HardHat,
  Settings,
  Cable,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "./ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "office"] },
  { href: "/leads", label: "Leads", icon: Users, roles: ["owner", "office"] },
  { href: "/clients", label: "Clients", icon: Users, roles: ["owner", "office"] },
  { href: "/estimates", label: "Estimates", icon: ClipboardList, roles: ["owner", "office"] },
  { href: "/projects", label: "Projects", icon: FolderKanban, roles: ["owner", "office", "technician"] },
  { href: "/invoices", label: "Invoices", icon: FileText, roles: ["owner", "office"] },
  { href: "/price-book", label: "Price book", icon: BookOpen, roles: ["owner", "office"] },
  { href: "/field", label: "Field / Today", icon: HardHat, roles: ["owner", "office", "technician"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["owner", "office", "technician"] },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { currentUser, users, setUser } = useStore();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-slate-950 text-slate-200 lg:flex">
        <Brand />
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {items.map((n) => (
            <NavLink key={n.href} href={n.href} active={path.startsWith(n.href)} icon={n.icon} label={n.label} />
          ))}
        </nav>
        <RoleSwitch users={users} currentId={currentUser.id} onChange={setUser} />
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button className="rounded-lg border border-slate-200 p-2" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 font-bold">
          <Cable className="text-amber-600" size={20} />
          Aestimare
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-950 text-slate-200">
            <div className="flex items-center justify-between px-2">
              <Brand />
              <button className="mr-2 rounded p-2" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 px-2 py-3">
              {items.map((n) => (
                <NavLink key={n.href} href={n.href} active={path.startsWith(n.href)} icon={n.icon} label={n.label} onClick={() => setOpen(false)} />
              ))}
            </nav>
            <RoleSwitch users={users} currentId={currentUser.id} onChange={setUser} />
          </div>
        </div>
      ) : null}

      <main className="lg:pl-60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-4 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
        <Cable size={20} />
      </div>
      <div>
        <div className="text-base font-bold leading-none text-white">Aestimare</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Low-voltage ops</div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  active,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  active: boolean;
  icon: typeof LayoutDashboard;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium tap",
        active ? "bg-amber-500/15 text-amber-300" : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

function RoleSwitch({
  users,
  currentId,
  onChange,
}: {
  users: { id: string; name: string; role: string }[];
  currentId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-t border-white/10 p-3">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">View as</div>
      <select
        value={currentId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-sm text-white"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
    </div>
  );
}
