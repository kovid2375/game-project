"use client";

import Image from "next/image";
import { CaseLocation } from "@/lib/api/cases.api";
import { MapPin, Search, FileText, Lock, Unlock } from "lucide-react";

interface LocationsTabProps {
  locations?: CaseLocation[];
}

export default function LocationsTab({ locations = [] }: LocationsTabProps) {
  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center mt-6">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <MapPin size={24} />
        </div>
        <h4 className="text-base font-bold text-neutral-800">No Locations Configured</h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Add crime scenes, apartments, or investigation points in this case.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
      {locations.map((loc) => {
        const cluesCount = loc.clues?.length ?? 0;
        const docsCount = loc.documents?.length ?? 0;

        return (
          <div
            key={loc.id}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
          >
            {/* Top Location Image / Map Preview */}
            <div className="relative w-full h-36 bg-neutral-900 border-b border-neutral-200">
              {loc.imageUrl ? (
                <Image
                  src={loc.imageUrl}
                  alt={loc.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 bg-neutral-100">
                  <MapPin size={28} className="text-neutral-400" />
                  <span className="text-[11px] font-medium mt-1">No Location Map / Photo</span>
                </div>
              )}

              {/* Status pill overlay */}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${
                    loc.isInitiallyOpen
                      ? "bg-emerald-500/90 text-white"
                      : "bg-neutral-800/90 text-neutral-200"
                  }`}
                >
                  {loc.isInitiallyOpen ? <Unlock size={11} /> : <Lock size={11} />}
                  <span>{loc.isInitiallyOpen ? "Initially Open" : "Locked"}</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-base font-bold text-neutral-900 leading-tight">
                  {loc.name}
                </h4>
                <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {loc.description || "No description provided."}
                </p>
              </div>

              {/* Meta clues & cost */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-neutral-700">
                    <Search size={13} className="text-neutral-400" />
                    <strong>{cluesCount}</strong> clues
                  </span>
                  <span className="flex items-center gap-1 text-neutral-700">
                    <FileText size={13} className="text-neutral-400" />
                    <strong>{docsCount}</strong> documents
                  </span>
                </div>

                {loc.searchActionPointCost ? (
                  <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md text-[11px]">
                    Cost: {loc.searchActionPointCost} AP
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

