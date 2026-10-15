"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { getAccessToken } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const adminUser =
      typeof window !== "undefined"
        ? localStorage.getItem("casefile_admin_user")
        : null;

    if (!isLoginPage) {
      if (!token || !adminUser) {
        router.replace("/admin/login");
        return;
      }
    } else {
      if (token && adminUser) {
        router.replace("/admin");
        return;
      }
    }

    setIsCheckingAuth(false);
  }, [pathname, isLoginPage, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-red-600" />
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono font-medium">
          Verifying Admin Session...
        </p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-neutral-900">
      {/* Sidebar — fixed 260 px */}
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-[260px] min-h-screen flex flex-col bg-[#F8F9FA]">
        <TopBar />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
