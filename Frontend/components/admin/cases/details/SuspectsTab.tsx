"use client";

import Image from "next/image";
import { CaseSuspect } from "@/lib/api/cases.api";
import { User, MessageSquare, Lock, Unlock, AlertCircle } from "lucide-react";

interface SuspectsTabProps {
  suspects?: CaseSuspect[];
}

export default function SuspectsTab({ suspects = [] }: SuspectsTabProps) {
  if (suspects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center mt-6">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <User size={24} />
        </div>
        <h4 className="text-base font-bold text-neutral-800">No Suspects Added</h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          This case has no persons of interest or suspects configured.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
      {suspects.map((suspect) => {
        const threadsCount = suspect.threads?.length ?? 0;
        const totalResponses =
          suspect.threads?.reduce(
            (acc, thread) => acc + (thread.responses?.length || 0),
            0
          ) ?? 0;

        return (
          <div
            key={suspect.id}
            className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
          >
            <div>
              {/* Avatar + Main Info */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                  {suspect.photoUrl ? (
                    <Image
                      src={suspect.photoUrl}
                      alt={suspect.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <User size={24} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-base font-bold text-neutral-900 truncate">
                    {suspect.name}
                  </h4>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 mt-0.5">
                    {suspect.relationship || "Unknown Relation"}
                  </span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-2.5 text-xs text-neutral-600">
                {suspect.description && (
                  <p className="line-clamp-2 leading-relaxed">
                    {suspect.description}
                  </p>
                )}

                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 space-y-1.5">
                  <div className="flex items-start gap-1">
                    <span className="font-semibold text-neutral-700 shrink-0">Alibi:</span>
                    <span className="text-neutral-600 italic line-clamp-2">
                      {suspect.claimedAlibi || "None provided"}
                    </span>
                  </div>

                  {suspect.connections && (
                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-neutral-700 shrink-0">Connections:</span>
                      <span className="text-neutral-600 line-clamp-1">
                        {suspect.connections}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <MessageSquare size={13} className="text-neutral-400" />
                <span>
                  <strong>{threadsCount}</strong> threads ({totalResponses} answers)
                </span>
              </div>

              <div className="flex items-center gap-1 font-medium">
                {suspect.isInitiallyUnlocked ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Unlock size={12} /> Available
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <Lock size={12} /> Locked
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

