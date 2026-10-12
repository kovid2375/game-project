"use client";

import React from "react";
import { X, Shield, Award, CheckCircle, Clock, Zap, BookOpen, ChevronRight } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c1017] border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#131923] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#e50914]" />
            <h3 className="font-bebas text-xl text-white tracking-wide">
              DETECTIVE DOSSIER & PROFILE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Identity card */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-red-600/80 flex items-center justify-center text-red-400 font-bebas text-2xl shadow-[0_0_15px_rgba(229,9,20,0.3)]">
              DET
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white">Investigator Cole</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-900/50 text-red-300 border border-red-700/50">
                  Badge #8491
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Special Crime Division • Rank: Senior Inspector
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-300">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> 14 Cases Solved
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">94.2% Accuracy</span>
              </div>
            </div>
          </div>

          {/* Detective Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded bg-black/40 border border-zinc-800">
              <div className="text-xs font-mono text-zinc-400 uppercase">Solve Rate</div>
              <div className="text-xl font-bebas text-white mt-1">94.2%</div>
            </div>
            <div className="p-3 rounded bg-black/40 border border-zinc-800">
              <div className="text-xs font-mono text-zinc-400 uppercase">Avg Time</div>
              <div className="text-xl font-bebas text-amber-400 mt-1">38 Min</div>
            </div>
            <div className="p-3 rounded bg-black/40 border border-zinc-800">
              <div className="text-xs font-mono text-zinc-400 uppercase">Rank</div>
              <div className="text-xl font-bebas text-red-400 mt-1">Top 3%</div>
            </div>
          </div>

          {/* Recent Ongoing Case */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Active Assignment
            </div>
            <div className="p-3.5 rounded bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">
                  Case #01: The Docks Murders
                </div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  Progress: 3 of 4 Clues Connected
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#e50914] text-white rounded hover:bg-[#ff1a25] transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#10151e] border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 rounded transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
