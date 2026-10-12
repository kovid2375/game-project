"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, ArrowRight, Folder, Paperclip } from "lucide-react";

interface CasesSectionProps {
  onSelectCase: (caseId: string) => void;
}

export default function CasesSection({ onSelectCase }: CasesSectionProps) {
  const cases = [
    {
      id: "case-01",
      number: "CASE 01",
      title: "THE SILENT CABIN",
      image: "/case_silent_cabin.jpg",
      tagline: "A weekend trip. A missing friend. Nothing adds up.",
      free: true,
      price: "FREE",
      badgeType: "free",
      sketch: "revolver",
    },
    {
      id: "case-02",
      number: "CASE 02",
      title: "THE RED MOTEL",
      image: "/case_red_motel.jpg",
      tagline: "A stranger. A false identity. A night that went wrong.",
      free: false,
      price: "₹10",
      badgeType: "paid",
      sketch: "key",
    },
    {
      id: "case-03",
      number: "CASE 03",
      title: "THE MISSING HEIR",
      image: "/case_missing_heir.jpg",
      tagline: "A wealthy family. A vanished heir. Secrets run deep.",
      free: false,
      price: "₹20",
      badgeType: "paid",
      sketch: "will",
    },
    {
      id: "case-04",
      number: "CASE 04",
      title: "THE FINAL VERDICT",
      image: "/case_courthouse.jpg",
      tagline: "A high-profile trial. A shocking twist. Can you uncover the truth?",
      free: false,
      price: "₹50",
      badgeType: "paid",
      sketch: "gavel",
    },
  ];

  return (
    <section id="cases" className="py-20 bg-[#06080b] relative border-t border-zinc-900/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[300px] bg-red-950/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-zinc-800/80 gap-4">
          {/* Left Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 shadow-inner">
                <Folder className="w-4 h-4 text-zinc-300" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-takeashot text-white tracking-widest uppercase">
                FEATURED CASES
              </h2>
            </div>
            {/* Red Underline indicator */}
            <div className="w-10 h-0.5 bg-red-600 mt-2 rounded-full shadow-[0_0_8px_#e50914]" />
          </div>

          {/* Right Subtitle & Link matching Image 1 */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 font-mono tracking-widest uppercase hover:text-white transition-colors cursor-pointer group">
            <span>FOUR CASES. FOUR DIFFERENT WORLDS. HOW SHARP ARE YOU?</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* 4 CASE DOSSIER CARDS MATCHING EXACT MANILA FOLDER PHOTO DESIGN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className="group cursor-pointer transition-all duration-300 hover:-translate-y-2 select-none"
            >
              {/* Manila Card Folder Wrap */}
              <div className="relative pt-3">
                {/* Stepped Tab on Top of Manila Folder */}
                <div className="absolute top-0 left-4 w-28 h-4 bg-[#c8beaa] border-t border-l border-r border-[#a89d87] rounded-t-md shadow-sm pointer-events-none group-hover:bg-[#d6cbba] transition-colors" />

                {/* Main Card Body */}
                <div className="relative bg-[#d1c6b2] text-[#1c1815] rounded-md rounded-tl-none border border-[#aba18b] shadow-[0_12px_28px_rgba(0,0,0,0.65)] overflow-hidden group-hover:shadow-[0_18px_36px_rgba(0,0,0,0.85)] group-hover:border-[#c5bba7] transition-all">
                  {/* Subtle aged paper gradient texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f3ead8]/25 via-transparent to-[#9e937d]/30 pointer-events-none" />

                  {/* Metal Paperclip at Top-Left */}
                  <div className="absolute top-2 left-4 z-20 pointer-events-none drop-shadow-md">
                    <svg
                      width="18"
                      height="38"
                      viewBox="0 0 20 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="opacity-90 group-hover:scale-105 transition-transform"
                    >
                      <path
                        d="M6 34V10C6 6.68629 8.68629 4 12 4C15.3137 4 18 6.68629 18 10V36C18 39.3137 15.3137 42 12 42C8.68629 42 6 39.3137 6 36V14C6 11.7909 7.79086 10 10 10C12.2091 10 14 11.7909 14 14V32"
                        stroke="#7a8594"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                      />
                      <path
                        d="M7 34V10C7 7.23858 9.23858 5 12 5C14.7614 5 17 7.23858 17 10V36C17 38.7614 14.7614 41 12 41C9.23858 41 7 38.7614 7 36V14"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeLinecap="round"
                        className="opacity-70"
                      />
                    </svg>
                  </div>

                  {/* Crime Scene Photo Container */}
                  <div className="p-3 pb-0 relative z-10">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-[#1a1c22] border border-[#2b2d35]/60 shadow-inner">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        className="object-cover group-hover:scale-105 filter contrast-110 brightness-95 group-hover:brightness-105 transition-all duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* Dark photographic vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                    </div>
                  </div>

                  {/* Folder Details & Typography */}
                  <div className="p-3.5 pt-3 relative z-10">
                    {/* Header Row: CASE XX and Price Badge */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-typewriter text-[11px] font-bold text-[#5c5447] tracking-wider uppercase">
                        {c.number}
                      </span>

                      {/* Badge matching screenshot */}
                      {c.free ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#294c3f] text-[#9de8c9] border border-[#1d382e] shadow-sm">
                          FREE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-[#2a1b0c] bg-[#e6be8b] border border-[#be9a68] shadow-sm">
                          <Lock className="w-3 h-3 text-[#3d2913]" />
                          <span>{c.price}</span>
                        </span>
                      )}
                    </div>

                    {/* Case Title */}
                    <h3 className="font-bebas text-xl text-[#1f1a14] group-hover:text-red-900 transition-colors tracking-wide leading-tight mb-1.5">
                      {c.title}
                    </h3>

                    {/* Short Teaser Tagline */}
                    <p className="font-sans text-[11px] text-[#4d4437] leading-relaxed line-clamp-2 min-h-[32px]">
                      {c.tagline}
                    </p>

                    {/* Subtle pencil sketch watermark on folder bottom */}
                    <div className="mt-3 pt-2 border-t border-[#b8ad96]/80 flex items-center justify-between text-[10px] font-typewriter text-[#736958]">
                      <span>DOSSIER // DEPT-09</span>
                      <span className="group-hover:text-red-800 transition-colors font-bold uppercase">
                        INSPECT →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
