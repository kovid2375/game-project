"use client";

import Link from "next/link";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { AdminUserDetail } from "@/lib/api/admin.api";

interface UserHeaderProps {
  user: AdminUserDetail;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserHeader({ user, onEdit, onDelete }: UserHeaderProps) {
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Admin Identity ── */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <Link
            href="/admin/users"
            className="hover:text-neutral-900 transition-colors"
          >
            Players
          </Link>
          <ChevronRight size={14} className="text-neutral-400" />
          <span className="text-neutral-800 font-semibold truncate max-w-xs">
            User Details
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold text-xs">
            CA
          </div>
          <div className="hidden sm:block text-right text-xs">
            <p className="font-semibold text-neutral-900 leading-tight">
              CASEFILE Admin
            </p>
            <p className="text-neutral-400 text-[11px] leading-tight">
              admin@casefile.com
            </p>
          </div>
        </div>
      </div>

      {/* ── User Profile Header Block matching reference ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div className="flex items-center gap-4">
          {/* Avatar initial circle */}
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 font-black text-2xl flex items-center justify-center shadow-2xs shrink-0">
            {initial}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              {user.email}
            </p>

            {/* Badges row */}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  user.isActive
                    ? "bg-amber-50 text-amber-800 border-amber-200/80"
                    : "bg-neutral-100 text-neutral-500 border-neutral-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-amber-500" : "bg-neutral-400"}`} />
                <span>{user.isActive ? "Active" : "Inactive"}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  user.emailVerifiedAt
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                    : "bg-neutral-50 text-neutral-500 border-neutral-200"
                }`}
              >
                <span>{user.emailVerifiedAt ? "Verified" : "Unverified"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold hover:bg-neutral-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Pencil size={14} className="text-neutral-600" />
            <span>Edit User</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-semibold hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 size={14} className="text-rose-600" />
            <span>Delete User</span>
          </button>
        </div>
      </div>
    </div>
  );
}

