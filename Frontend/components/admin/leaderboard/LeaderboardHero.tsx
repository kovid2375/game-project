"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function LeaderboardHero() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <Link
            href="/admin"
            className="hover:text-neutral-900 transition-colors"
          >
            Home
          </Link>
          <ChevronRight size={14} className="text-neutral-400" />
          <span className="text-neutral-800 font-semibold truncate">
            Leaderboards
          </span>
        </nav>

        <span className="text-xs font-semibold text-neutral-500 font-mono">
          {currentDate}
        </span>
      </div>

      {/* ── Dark Hero Banner matching reference image ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c0d12] text-white p-7 shadow-xl border border-neutral-800">
        {/* Glow ambient background elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none bg-gradient-to-l from-red-600/30 via-transparent to-transparent" />
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Player Leaderboards
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Top <span className="text-red-600">Detectives</span>
          </h1>

          <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
            Track and analyze player performance across all cases. See who solved
            cases the fastest with the highest scores.
          </p>
        </div>
      </div>
    </div>
  );
}

