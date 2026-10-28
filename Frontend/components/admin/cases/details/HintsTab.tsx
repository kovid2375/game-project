"use client";

import { CaseHint } from "@/lib/api/cases.api";
import { HelpCircle, AlertCircle } from "lucide-react";

interface HintsTabProps {
  hints?: CaseHint[];
}

export default function HintsTab({ hints = [] }: HintsTabProps) {
  if (hints.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center mt-6">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <HelpCircle size={24} />
        </div>
        <h4 className="text-base font-bold text-neutral-800">No Hints Configured</h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Add progressive hints for players who might get stuck during gameplay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-6 max-w-4xl">
      {hints.map((hint, idx) => (
        <div
          key={hint.id || idx}
          className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex items-start gap-4"
        >
          <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-sm shrink-0">
            #{hint.hintNumber ?? idx + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <h4 className="text-sm font-bold text-neutral-900">
                Hint #{hint.hintNumber ?? idx + 1}
              </h4>
              {(typeof hint.scorePenalty === "number" || typeof hint.penaltySeconds === "number") && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  +{hint.scorePenalty ?? hint.penaltySeconds} Penalty
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-100">
              {hint.content || hint.hintText}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

