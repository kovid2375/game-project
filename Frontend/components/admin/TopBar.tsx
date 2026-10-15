"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw, LogOut } from "lucide-react";
import { setAccessToken } from "@/lib/api/client";

const pageMeta: Record<string, { label: string; subtitle: string }> = {
  "/admin": {
    label: "Dashboard",
    subtitle: "Real-time metrics, gameplay analytics, and platform health",
  },
  "/admin/users": {
    label: "Players Management",
    subtitle: "Manage and inspect registered detective player accounts",
  },
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const page = pageMeta[pathname] ?? pageMeta["/admin"]!;

  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("casefile_admin_user");
      if (stored) {
        setAdminUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem("casefile_admin_user");
    router.push("/admin/login");
  };

  const displayName = adminUser?.name || "Admin";
  const displayEmail = adminUser?.email || "admin@casefile.io";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Left — page title */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-semibold">
              Live System
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight leading-snug">
            {page.label}
          </h1>
          <p className="text-xs text-neutral-500">{page.subtitle}</p>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-600 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer group shadow-2xs"
          >
            <RefreshCw
              size={13}
              className="group-hover:rotate-180 transition-transform duration-500 text-neutral-400 group-hover:text-red-600"
            />
            Refresh
          </button>

          {/* Admin avatar & logout */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shadow-xs">
              <span className="text-xs font-bold text-red-600">{initial}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-neutral-900 leading-none">
                {displayName}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                {displayEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="ml-1 p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
