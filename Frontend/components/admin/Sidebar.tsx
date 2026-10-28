"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Trophy,
  Settings,
  Search,
  ShieldAlert,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Cases", href: "/admin/cases", icon: Briefcase },
  { label: "Leaderboards", href: "/admin/leaderboards", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-neutral-200 flex flex-col z-50 shadow-sm">
      {/* ── Logo ── */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-neutral-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md shadow-red-500/20">
          <span className="text-white font-black text-lg tracking-wider">C</span>
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-neutral-900 block leading-tight">
            CASEFILE
          </span>
          <span className="text-[10px] uppercase font-semibold text-red-600 tracking-wider">
            Admin Portal
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 mt-5 mb-2">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-400 hover:border-red-300 hover:text-neutral-600 transition-colors cursor-pointer text-left">
          <Search size={15} />
          <span className="text-xs flex-1 text-neutral-500">Quick search…</span>
          <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Section Title ── */}
      <div className="px-5 mt-4 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Management
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-red-50 text-red-600 border border-red-200/80 shadow-xs font-semibold"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <item.icon
                size={18}
                className={
                  active ? "text-red-600" : "text-neutral-400 group-hover:text-red-500"
                }
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="p-3 border-t border-neutral-100 space-y-1">
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all cursor-pointer">
          <Settings size={18} className="text-neutral-400" />
          Settings
        </button>
      </div>
    </aside>
  );
}
