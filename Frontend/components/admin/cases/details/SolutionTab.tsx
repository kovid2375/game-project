"use client";

import Image from "next/image";
import { CaseSolution, CaseSuspect } from "@/lib/api/cases.api";
import { CheckCircle2, User, Key, HelpCircle, ShieldCheck } from "lucide-react";

interface SolutionTabProps {
  solution?: CaseSolution | null;
  suspects?: CaseSuspect[];
}

export default function SolutionTab({
  solution,
  suspects = [],
}: SolutionTabProps) {
  if (!solution) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center mt-6">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <HelpCircle size={24} />
        </div>
        <h4 className="text-base font-bold text-neutral-800">No Solution Configured</h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Specify the actual killer, motive, method, and mystery solution breakdown.
        </p>
      </div>
    );
  }

  const culprit = suspects.find((s) => s.id === solution.correctSuspectId);

  return (
    <div className="space-y-6 pt-6 max-w-4xl">
      {/* ── Culprit Banner ── */}
      <div className="bg-gradient-to-br from-red-950 via-neutral-900 to-black text-white p-6 rounded-2xl border border-red-900/50 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-800 border-2 border-red-500 shrink-0">
              {culprit?.photoUrl ? (
                <Image
                  src={culprit.photoUrl}
                  alt={culprit.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <User size={28} />
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                <ShieldCheck size={14} /> Correct Suspect / Culprit
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white mt-0.5">
                {culprit ? culprit.name : "Unknown Culprit ID: " + solution.correctSuspectId}
              </h3>
              {culprit?.relationship && (
                <p className="text-xs text-neutral-400 font-medium">
                  {culprit.relationship}
                </p>
              )}
            </div>
          </div>

          <div className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            Case Closed Logic
          </div>
        </div>
      </div>

      {/* ── Motive & Method ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Motive */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Key size={16} />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Motive</h4>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-100">
            {solution.motive || "No motive described."}
          </p>

          {solution.motiveKeywords && solution.motiveKeywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-neutral-400 font-medium mr-1 self-center">
                Keywords:
              </span>
              {solution.motiveKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Method */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Method</h4>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-100">
            {solution.method || "No method described."}
          </p>

          {solution.methodKeywords && solution.methodKeywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-neutral-400 font-medium mr-1 self-center">
                Keywords:
              </span>
              {solution.methodKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Full Explanation ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <h4 className="text-base font-bold text-neutral-900 mb-2">
          Full Case Explanation
        </h4>
        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line bg-neutral-50/70 p-4 rounded-xl border border-neutral-100">
          {solution.explanation || "No full explanation provided."}
        </p>
      </div>

      {/* ── Epilogue ── */}
      {solution.epilogue && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <h4 className="text-base font-bold text-neutral-900 mb-2">
            Epilogue / Story Conclusion
          </h4>
          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line bg-neutral-50/70 p-4 rounded-xl border border-neutral-100 italic">
            "{solution.epilogue}"
          </p>
        </div>
      )}
    </div>
  );
}

