"use client";

import Link from "next/link";
import { 
  Trophy, 
  ExternalLink, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Loader2,
  FolderOpen
} from "lucide-react";
import { LeaderboardEntry } from "@/lib/api/leaderboard.api";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  selectedCaseId: string;
}

export default function LeaderboardTable({
  entries,
  isLoading,
  selectedCaseId,
}: LeaderboardTableProps) {
  const formatSeconds = (sec?: number) => {
    if (typeof sec !== "number" || sec <= 0) return "—";
    const mins = Math.floor(sec / 60);
    const remainderSec = sec % 60;
    return `${mins}m ${remainderSec}s`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50/75 border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4 min-w-[200px]">Player</th>
              <th className="py-3.5 px-4 text-center">Total Score</th>
              <th className="py-3.5 px-4 text-center">
                {selectedCaseId === "all" ? "Case / Completed" : "Hints / Attempts"}
              </th>
              <th className="py-3.5 px-4 text-center">Fastest Time</th>
              <th className="py-3.5 px-4">Completed Date</th>
              <th className="py-3.5 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 size={26} className="animate-spin text-red-600" />
                    <span className="text-xs font-medium text-neutral-400">
                      Loading leaderboard rankings…
                    </span>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <Trophy size={20} />
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      No detective scores logged yet
                    </span>
                    <span className="text-xs text-neutral-400 max-w-xs">
                      When players solve mystery cases, their rankings and times will appear here.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((item, idx) => {
                const rank = item.rank || idx + 1;
                const initial = item.playerName ? item.playerName.charAt(0).toUpperCase() : "P";

                return (
                  <tr
                    key={`${item.playerName}-${idx}`}
                    className="hover:bg-neutral-50/70 transition-colors group"
                  >
                    {/* Rank Indicator */}
                    <td className="py-3.5 px-4 text-center">
                      {rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-xs shadow-2xs">
                          🥇
                        </span>
                      ) : rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs shadow-2xs">
                          🥈
                        </span>
                      ) : rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-800 font-black text-xs shadow-2xs">
                          🥉
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-neutral-400">
                          {rank}
                        </span>
                      )}
                    </td>

                    {/* Player Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {item.playerName}
                          </p>
                          <p className="text-xs text-neutral-400 font-mono truncate">
                            {item.userEmail || `${item.playerName.toLowerCase().replace(/\s+/g, '_')}@casefile.com`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total Score */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-black text-neutral-900 font-mono">
                        {item.score.toLocaleString()}
                      </span>
                    </td>

                    {/* Case or Completion Info */}
                    <td className="py-3.5 px-4 text-center text-xs">
                      {selectedCaseId === "all" ? (
                        item.caseTitle ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium truncate max-w-[150px]">
                            {item.caseTitle}
                          </span>
                        ) : (
                          <span className="font-semibold text-neutral-700">
                            {item.casesCompleted ?? 1}
                          </span>
                        )
                      ) : (
                        <span className="text-neutral-500">
                          {item.hintsUsed ?? 0} hints / {item.attemptsUsed ?? 1} attempts
                        </span>
                      )}
                    </td>

                    {/* Fastest Time */}
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-neutral-700 font-mono">
                      {formatSeconds(item.completionTimeSeconds)}
                    </td>

                    {/* Completed Date */}
                    <td className="py-3.5 px-4 text-xs text-neutral-500 font-medium">
                      {formatDate(item.completedAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href="/admin/users"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                        >
                          <ExternalLink size={12} />
                          <span>View</span>
                        </Link>
                        <button
                          type="button"
                          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Footer ── */}
      {!isLoading && entries.length > 0 && (
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50 text-xs text-neutral-500">
          <span>
            Showing 1 to {entries.length} of {entries.length} rankings
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-400 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <button
              disabled
              className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-400 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

