"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Fingerprint,
  GitGraph,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileText,
  MapPin,
  Lock,
} from "lucide-react";
import TechText from "./TechText";

interface HeroProps {
  onStartInvestigating: () => void;
  onSelectClue?: (clueId: string) => void;
}

export default function Hero({ onStartInvestigating, onSelectClue }: HeroProps) {
  const [hoveredClue, setHoveredClue] = useState<string | null>(null);

  const pillars = [
    {
      icon: Fingerprint,
      title: "Investigate",
      subtitle: "Cases",
      description: "Analyze dossiers & crime scenes",
    },
    {
      icon: GitGraph,
      title: "Solve",
      subtitle: "Puzzles",
      description: "Decode ciphers & timestamps",
    },
    {
      icon: Users,
      title: "Play Solo",
      subtitle: "or in Teams",
      description: "Collaborate in real-time",
    },
    {
      icon: Trophy,
      title: "Compete on",
      subtitle: "Leaderboards",
      description: "Climb the master detective ranks",
    },
  ];

  const evidencePins = [
    {
      id: "dock-scene",
      label: "THE DOCKS",
      sub: "Crime Scene 01",
      top: "22%",
      right: "18%",
      color: "bg-red-500",
      type: "Primary Evidence",
    },
    {
      id: "hotel-lux",
      label: "HOTEL LUX",
      sub: "Suspect Alibi",
      top: "38%",
      right: "32%",
      color: "bg-amber-400",
      type: "Alibi Discrepancy",
    },
    {
      id: "witness-statement",
      label: "WITNESS #4",
      sub: "Midnight Sighting",
      top: "45%",
      right: "12%",
      color: "bg-sky-400",
      type: "Confidential Statement",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-[#07090d]">
      {/* BACKGROUND IMAGE WITH CINEMATIC LIGHTING & NOIR VIGNETTE */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Detective crime board and investigation desk"
          fill
          priority
          className="object-cover object-center sm:object-[center_right] opacity-75 sm:opacity-85 mix-blend-luminosity filter contrast-[1.15] brightness-[0.85]"
          sizes="100vw"
        />

        {/* Ambient Dark Gradient on Left for pristine text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090d] via-[#07090d]/90 to-transparent sm:w-[65%]" />
        
        {/* Full-frame cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_20%,_#07090d_85%)]" />

        {/* Desk lamp warm tungsten glow highlight overlay on right */}
        <div className="absolute top-[20%] right-[15%] w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Crime board red glow */}
        <div className="absolute top-[30%] right-[30%] w-[320px] h-[320px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle film grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* INTERACTIVE PUSH PINS ON THE EVIDENCE BOARD (VISIBLE ON DESKTOP) */}
      <div className="hidden xl:block absolute inset-0 z-10 pointer-events-none">
        {evidencePins.map((pin) => (
          <div
            key={pin.id}
            style={{ top: pin.top, right: pin.right }}
            className="absolute pointer-events-auto group cursor-pointer"
            onClick={() => onSelectClue?.(pin.id)}
            onMouseEnter={() => setHoveredClue(pin.id)}
            onMouseLeave={() => setHoveredClue(null)}
          >
            {/* Pulsing Pin Ring */}
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-500 opacity-40"></span>
              <div className="pushpin group-hover:scale-125 transition-transform duration-200" />
            </div>

            {/* Hover Tooltip / Clue Tag */}
            <div
              className={`absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-[#0d1117]/95 border border-zinc-700/80 rounded-md p-2.5 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none ${
                hoveredClue === pin.id
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-red-400 font-mono font-semibold uppercase tracking-wider mb-1">
                <span>{pin.type}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-wide">
                {pin.label}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                {pin.sub}
              </div>
              <div className="mt-2 text-[10px] text-zinc-300 flex items-center gap-1 border-t border-zinc-800 pt-1 font-sans">
                <Search className="w-3 h-3 text-red-400" /> Click to inspect dossier
              </div>
            </div>
          </div>
        ))}

        {/* Vintage Sticky Notes matching the reference photo */}
        <div className="absolute top-[18%] right-[44%] -rotate-3 pointer-events-auto cursor-default">
          <div className="bg-[#f2e6b6]/90 text-[#2c2014] font-typewriter text-xs sm:text-sm px-3 py-2 rounded shadow-xl border border-[#d6c589] max-w-[170px] select-none hover:rotate-0 transition-transform">
            <span className="block font-bold tracking-tight text-[11px] text-red-800 uppercase mb-0.5">NOTE #42</span>
            DIFFERENT PEOPLE. SAME QUESTIONS.
          </div>
        </div>

        <div className="absolute top-[48%] right-[8%] rotate-2 pointer-events-auto cursor-default">
          <div className="bg-[#e9dfbe]/85 text-[#1f1a14] font-typewriter text-xs px-3.5 py-2.5 rounded shadow-xl border border-[#c5b88f] max-w-[180px] select-none hover:-rotate-1 transition-transform">
            <span className="text-[11px] tracking-wide font-bold italic block text-amber-900">ARE YOU JUST PLAYING...</span>
            <span className="font-bold text-red-700 uppercase tracking-wider">OR SOLVING?</span>
          </div>
        </div>

        <div className="absolute bottom-[16%] right-[24%] -rotate-2 pointer-events-auto cursor-default">
          <div className="bg-[#121620]/90 text-zinc-300 border border-zinc-700/80 px-3 py-1.5 rounded text-[11px] font-mono shadow-2xl backdrop-blur-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>&quot;Good detectives ask better questions.&quot;</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* TAGLINE ABOVE TITLE */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#e50914] shadow-[0_0_8px_#e50914] animate-pulse"></span>
            <p className="text-xs sm:text-sm tracking-[0.25em] text-zinc-400 font-mono uppercase font-semibold">
              REAL CLUES. TRUE MINDS. YOUR MOVE.
            </p>
          </div>

          {/* MAIN HEADLINE: TECHTEXT WITH TAKE A SHOT FONT (CASE IN WHITE, FILE IN RED) */}
          <div className="mb-4 -ml-10 relative flex items-center w-full">
            <div className="w-full max-w-[680px] h-[110px] sm:h-[140px] md:h-[170px] lg:h-[170px] relative select-none">
              <TechText
                text="CASEFILE"
                fontWeight={200}
                fontSize={170}
                fontFamily="'Take A Shot', sans-serif"
                colors={["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#e50914", "#e50914", "#e50914", "#e50914"]}
                color="#FF0000"
                accentColor="#e50914"
                letterSpacing={0.02}
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={16}
                reach={220}
                softness={0.75}
                strokeWidth={1.8}
                speed={1}
                lineStyle="dashed"
                selection
                labels
                draggable
                sweep
              />
            </div>
            <span className="text-2xl sm:text-3xl lg:text-4xl text-[#e50914] ml-2 -top-6 sm:-top-8 lg:-top-10 relative font-sans font-bold select-none drop-shadow-[0_0_12px_rgba(229,9,20,0.8)]">
              ®
            </span>
          </div>

          {/* SUBTITLE */}
          <p className="text-base sm:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-xl mb-9 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            An online detective game where you examine evidence, connect the
            dots, and solve real-world inspired cases.
          </p>

          {/* 4 FEATURE HIGHLIGHT BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-9 max-w-2xl">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group flex flex-col items-start p-3 sm:p-3.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 hover:border-red-500/50 backdrop-blur-sm transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectClue?.(`feature-${idx}`)}
                >
                  <div className="mb-2 text-zinc-300 group-hover:text-[#e50914] transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-zinc-100 group-hover:text-white leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-zinc-300 leading-tight">
                    {item.subtitle}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA BUTTON & PERK */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <button
              onClick={onStartInvestigating}
              type="button"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold uppercase tracking-wider text-white bg-[#e50914] hover:bg-[#ff1a25] rounded-md btn-red-glow transition-all active:scale-[0.98]"
            >
              <span>START INVESTIGATING</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Subtext under button */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>FIRST CASE FREE</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500 font-sans tracking-normal text-xs">No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM VIGNETTE / TRANSITION GRADIENT */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#07090d] via-[#07090d]/80 to-transparent pointer-events-none z-10" />
    </section>
  );
}
