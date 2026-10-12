"use client";

import React, { useState } from "react";
import { Search, X, Folder, FileText, ArrowRight, Shield } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectCase,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const mockResults = [
    {
      id: "case-01",
      title: "The Docks Murders",
      type: "Active Cold Case",
      difficulty: "Medium",
      tags: "Pier 9, Watchman, Smuggling",
    },
    {
      id: "case-02",
      title: "The Midnight Heist",
      type: "Bank Robbery",
      difficulty: "Hard",
      tags: "Vault, Laser Sensors, Inside Job",
    },
    {
      id: "case-03",
      title: "The Ghost Protocol",
      type: "Cyber Espionage",
      difficulty: "Expert",
      tags: "Encrypted Hard Drive, Embassy, Alias",
    },
    {
      id: "case-04",
      title: "The Blackwood Poisoning",
      type: "Estate Mystery",
      difficulty: "Easy",
      tags: "Will, Arsenic, Manor Grounds",
    },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0d1117] border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-[#121620]">
          <Search className="w-5 h-5 text-red-500 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, suspects, clues, or dossiers..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-zinc-400 hover:text-white mr-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-2">
          <div className="px-2 py-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Available Case Files ({mockResults.length})
          </div>

          {mockResults.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No matching records found in central police archives.
            </div>
          ) : (
            mockResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectCase(item.id);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-red-950/40 text-red-400 mt-0.5">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      {item.type} • {item.tags}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    {item.difficulty}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
