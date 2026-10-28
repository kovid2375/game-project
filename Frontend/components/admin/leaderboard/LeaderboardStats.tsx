"use client";

import { Trophy, Target, Award, Clock } from "lucide-react";

interface LeaderboardStatsProps {
  totalPlayers: number;
  completedPlayers: number;
  topScore: number;
  topScorerName: string;
  fastestTime: string;
  fastestSolverName: string;
}

export default function LeaderboardStats({
  totalPlayers,
  completedPlayers,
  topScore,
  topScorerName,
  fastestTime,
  fastestSolverName,
}: LeaderboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {/* 1. Total Players */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block">
              Total Players
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-black text-neutral-900">
                {totalPlayers.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                +12%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Players with Completed Cases */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block">
              Completed Cases
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-black text-neutral-900">
                {completedPlayers.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                +18%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Score (All Time) */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block">
              Top Score (All Time)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-neutral-900">
                {topScore.toLocaleString()}
              </span>
              {topScorerName && (
                <span className="text-[11px] text-neutral-400 truncate max-w-[90px]">
                  by {topScorerName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Fastest Completion */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block">
              Fastest Completion
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-neutral-900">
                {fastestTime || "—"}
              </span>
              {fastestSolverName && (
                <span className="text-[11px] text-neutral-400 truncate max-w-[90px]">
                  by {fastestSolverName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

