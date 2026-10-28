"use client";

import Link from "next/link";
import { AdminUserDetail } from "@/lib/api/admin.api";
import { FolderOpen, Award, Clock, ArrowRight } from "lucide-react";

interface UserGameProgressTabProps {
  playerCases?: AdminUserDetail["playerCases"];
}

export default function UserGameProgressTab({
  playerCases = [],
}: UserGameProgressTabProps) {
  if (playerCases.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-12 text-center mt-6">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <FolderOpen size={24} />
        </div>
        <h4 className="text-base font-bold text-neutral-800">
          No Case Activity Recorded
        </h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          This player has not opened or played any detective mystery cases yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {playerCases.map((pc) => (
          <div
            key={pc.id}
            className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Case #{pc.gameCase?.caseNumber ?? "—"}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    pc.status === "SOLVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : pc.status === "FAILED"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {pc.status.replace("_", " ")}
                </span>
              </div>

              <h4 className="text-base font-bold text-neutral-900 leading-snug">
                {pc.gameCase?.title || "Investigation"}
              </h4>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Score</span>
                  <span className="font-bold text-neutral-800">{pc.score} pts</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Current Phase</span>
                  <span className="font-bold text-neutral-800">Phase {pc.currentPhase}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Clues Discovered</span>
                  <span className="font-bold text-neutral-800">
                    {pc.discoveries?.length ?? 0}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Hints Used</span>
                  <span className="font-bold text-neutral-800">{pc.hintsUsed}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(pc.lastActivityAt).toLocaleDateString()}
              </span>
              {pc.gameCase?.id && (
                <Link
                  href={`/admin/cases/${pc.gameCase.id}`}
                  className="font-semibold text-neutral-700 hover:text-red-600 flex items-center gap-0.5"
                >
                  <span>View Case</span>
                  <ArrowRight size={11} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

