"use client";

import { AdminUserDetail } from "@/lib/api/admin.api";

interface UserOverviewTabProps {
  user: AdminUserDetail;
}

export default function UserOverviewTab({ user }: UserOverviewTabProps) {
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-8 shadow-2xs mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16 max-w-4xl text-sm">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500 font-medium">Name</span>
            <span className="font-semibold text-neutral-900">{user.name}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500 font-medium">Email</span>
            <span className="font-mono text-neutral-700 text-xs sm:text-sm">
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500 font-medium">Role</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
              {user.role}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 font-medium">Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                user.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-neutral-100 text-neutral-600 border border-neutral-200"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500 font-medium">Registered At</span>
            <span className="font-medium text-neutral-800">
              {formatDateTime(user.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500 font-medium">Last Login</span>
            <span className="font-medium text-neutral-800">
              {formatDateTime(user.lastLogin)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-500 font-medium">Email Status</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                user.emailVerifiedAt
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {user.emailVerifiedAt ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

