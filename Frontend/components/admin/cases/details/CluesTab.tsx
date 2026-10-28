"use client";

import Image from "next/image";
import { CaseLocation, LocationClue, LocationDocument } from "@/lib/api/cases.api";
import { Search, FileText, Tag } from "lucide-react";

interface CluesTabProps {
  locations?: CaseLocation[];
}

export default function CluesTab({ locations = [] }: CluesTabProps) {
  // Aggregate all clues with location context
  const allClues: (LocationClue & { locationName: string })[] = [];
  const allDocs: (LocationDocument & { locationName: string })[] = [];

  locations.forEach((loc) => {
    loc.clues?.forEach((clue) => {
      allClues.push({ ...clue, locationName: loc.name });
    });
    loc.documents?.forEach((doc) => {
      allDocs.push({ ...doc, locationName: loc.name });
    });
  });

  if (allClues.length === 0 && allDocs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center mt-6">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <Search size={24} />
        </div>
        <h4 className="text-base font-bold text-neutral-800">No Clues or Documents</h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Add clues, evidence photos, or documents to locations in this case.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6">
      {/* ── Section 1: Physical Clues ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Search size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Evidence & Physical Clues ({allClues.length})
            </h3>
            <p className="text-xs text-neutral-500">Items discovered during search investigations</p>
          </div>
        </div>

        {allClues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allClues.map((clue) => (
              <div
                key={clue.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                {clue.imageUrl && (
                  <div className="relative w-full h-36 bg-neutral-900 border-b border-neutral-100">
                    <Image
                      src={clue.imageUrl}
                      alt={clue.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 350px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                        {clue.locationName}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {clue.title}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed line-clamp-3">
                      {clue.description}
                    </p>
                  </div>

                  {clue.tags && clue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-neutral-100">
                      {clue.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600"
                        >
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic">No physical clues recorded.</p>
        )}
      </div>

      {/* ── Section 2: Case Documents ── */}
      {allDocs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Documents & Records ({allDocs.length})
              </h3>
              <p className="text-xs text-neutral-500">Written notes, files, receipts, or diary logs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    {doc.locationName}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {doc.description}
                  </p>

                  {doc.content && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs font-mono text-neutral-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {doc.content}
                    </div>
                  )}
                </div>

                {doc.fileUrl && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      View Attached Document →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

