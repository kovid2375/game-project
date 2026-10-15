"use client";

import { Search, ChevronDown, UserCheck } from "lucide-react";

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  totalCount: number;
}

export default function UserFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  totalCount,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      {/* Search */}
      <div className="flex-1 w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10 transition-all shadow-2xs">
        <Search size={16} className="text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="Search players by name or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-400 flex-1 min-w-0"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="appearance-none pl-3.5 pr-9 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer min-w-[140px] shadow-2xs font-medium"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
      </div>

      {/* Count badge */}
      <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg shadow-2xs">
        <span className="text-xs text-neutral-500">Total Players:</span>
        <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
          {totalCount}
        </span>
      </div>
    </div>
  );
}
