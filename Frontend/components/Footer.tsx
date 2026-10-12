"use client";

import React from "react";
import Image from "next/image";
import { Timer, Users, Award, Fingerprint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#040608] border-t border-zinc-900 text-zinc-400 font-sans relative overflow-hidden">
      {/* ======================================================== */}
      {/* DETECTIVE MOTTO & STATS BANNER (MATCHING IMAGE 2 EXACTLY) */}
      {/* ======================================================== */}
      <div className="relative border-b border-zinc-800/80 bg-gradient-to-r from-[#05080c] via-[#070b10] to-[#040608] overflow-hidden">
        {/* Large Faint Fingerprint Watermark on Far Right */}
        <div className="absolute -right-8 -top-12 bottom-0 w-64 h-64 pointer-events-none select-none opacity-25 flex items-center justify-center">
          <Fingerprint
            className="w-full h-full text-zinc-300 stroke-[1]"
            aria-hidden="true"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6">
            
            {/* LEFT SECTION: DETECTIVES PHOTO + "SOLVE FASTER. CLIMB HIGHER." */}
            <div className="flex items-center gap-5 sm:gap-6 w-full lg:w-auto">
              {/* Detectives photo */}
              <div className="relative w-28 h-20 sm:w-36 sm:h-22 rounded overflow-hidden shrink-0 border border-zinc-700/60 shadow-2xl">
                <Image
                  src="/footer_detectives.jpg"
                  alt="Detectives on stakeout"
                  fill
                  className="object-cover object-center filter contrast-125 brightness-90"
                  sizes="160px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#070b10]/90" />
              </div>

              {/* Tagline text */}
              <div className="font-mono text-sm sm:text-base font-semibold tracking-[0.2em] text-zinc-200 uppercase leading-snug whitespace-nowrap">
                <div>SOLVE FASTER.</div>
                <div className="text-zinc-400">CLIMB HIGHER.</div>
              </div>

              {/* Vertical divider on desktop */}
              <div className="hidden sm:block h-12 w-[1px] bg-zinc-800 ml-2" />
            </div>

            {/* MIDDLE SECTION: 3 KEY PILLARS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 w-full lg:w-auto">
              {/* Pillar 1: Speed-Based Leaderboards */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-zinc-900 border border-zinc-700/70 text-zinc-200 shrink-0">
                  <Timer className="w-5 h-5 text-zinc-100" />
                </div>
                <span className="text-xs sm:text-sm font-sans font-medium text-zinc-300 tracking-wide">
                  Speed-Based<br />Leaderboards
                </span>
              </div>

              {/* Pillar 2: Team Up (2–3 Players) */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-zinc-900 border border-zinc-700/70 text-zinc-200 shrink-0">
                  <Users className="w-5 h-5 text-zinc-100" />
                </div>
                <span className="text-xs sm:text-sm font-sans font-medium text-zinc-300 tracking-wide">
                  Team Up<br />(2–3 Players)
                </span>
              </div>

              {/* Pillar 3: Earn Badges & Achievements */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-zinc-900 border border-zinc-700/70 text-zinc-200 shrink-0">
                  <Award className="w-5 h-5 text-zinc-100" />
                </div>
                <span className="text-xs sm:text-sm font-sans font-medium text-zinc-300 tracking-wide">
                  Earn Badges<br />& Achievements
                </span>
              </div>
            </div>

            {/* RIGHT SECTION: HANDWRITTEN CIRCE STAMP "SOME CASES STAY WITH YOU." */}
            <div className="relative py-2 px-4 select-none shrink-0">
              {/* Hand-drawn Red Oval / Lasso SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none -rotate-2 scale-110"
                viewBox="0 0 320 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 42C12 24 65 10 160 10C260 10 308 22 304 42C300 60 238 72 152 71C60 70 20 58 24 38C26 26 80 14 175 14"
                  stroke="#e50914"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90 drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]"
                />
                <path
                  d="M26 38C35 22 92 12 170 12C250 12 295 24 290 44C285 58 225 68 150 67"
                  stroke="#ff4d4d"
                  strokeWidth="1"
                  strokeLinecap="round"
                  className="opacity-70"
                />
              </svg>

              {/* Distressed Red Text */}
              <div className="font-takeashot text-lg sm:text-xl lg:text-2xl text-[#ff2b34] tracking-[0.18em] -rotate-2 drop-shadow-[0_0_12px_rgba(229,9,20,0.5)] px-3 py-1 uppercase">
                &quot;SOME CASES STAY WITH YOU.&quot;
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LOWER FOOTER: BRANDING & NAVIGATION LINKS                */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="font-takeashot text-2xl tracking-wider">
              <span className="text-white">CASE</span>
              <span className="text-[#e50914]">FILE</span>
              <span className="text-[10px] text-[#e50914] ml-0.5 font-sans font-bold">®</span>
            </div>
            <span className="text-zinc-700">|</span>
            <span className="font-mono text-[11px] text-zinc-500">
              ONLINE FORENSIC DETECTIVE INVESTIGATIONS
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
            <a href="#cases" className="hover:text-white transition-colors">Cases</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#" className="hover:text-white transition-colors">Bureau Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
          </div>

          {/* Copyright */}
          <div className="text-zinc-500 text-[11px] font-mono">
            © 2026 CASEFILE® Interactive. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
