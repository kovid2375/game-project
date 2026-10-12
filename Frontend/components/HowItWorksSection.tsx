"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  User,
  Home,
  MapPin,
  MousePointerClick,
  Compass,
  Search,
  FileCheck2,
  Dna,
  MessageSquare,
  Lock,
  Eye,
  Network,
  Link2,
  Target,
  Sparkles,
} from "lucide-react";

interface HowItWorksSectionProps {
  onStartInvestigating?: () => void;
}

export default function HowItWorksSection({
  onStartInvestigating,
}: HowItWorksSectionProps) {
  const [selectedDialogue, setSelectedDialogue] = useState<number>(0);

  const steps = [
    {
      step: "01",
      title: "Read the Case Brief",
      subtitle:
        "Learn about the crime, the victim, initial evidence and what happened.",
      image: "/how_step1_brief.jpg",
      bullets: [
        { icon: FileText, text: "Case introduction" },
        { icon: User, text: "Victim profile" },
        { icon: Home, text: "Initial findings" },
      ],
    },
    {
      step: "02",
      title: "Explore Locations",
      subtitle:
        "Visit different locations, examine crime scenes and find hidden clues.",
      image: "/how_step2_map.jpg",
      bullets: [
        { icon: MapPin, text: "Interactive map" },
        { icon: MousePointerClick, text: "Click to inspect" },
        { icon: Compass, text: "Unlock new areas" },
      ],
    },
    {
      step: "03",
      title: "Collect Evidence",
      subtitle:
        "Find and analyze important evidence like documents, photos, objects and digital data.",
      image: "/how_step3_knife.jpg",
      bullets: [
        { icon: Search, text: "Inspect objects" },
        { icon: FileCheck2, text: "Analyze documents" },
        { icon: Dna, text: "View forensic reports" },
      ],
    },
    {
      step: "04",
      title: "Question Suspects",
      subtitle:
        "Talk to suspects, compare their statements and find contradictions.",
      customCard: "interrogation",
      image: "/how_step4_suspect.jpg",
      bullets: [
        { icon: MessageSquare, text: "Dynamic dialogues" },
        { icon: Lock, text: "Unlock follow-up questions" },
        { icon: Eye, text: "Detect lies & inconsistencies" },
      ],
    },
    {
      step: "05",
      title: "Connect the Dots",
      subtitle:
        "Use all the clues to build your theory and identify who the criminal is.",
      image: "/how_step5_board.jpg",
      bullets: [
        { icon: Network, text: "Investigation board" },
        { icon: Link2, text: "Link evidence & motives" },
        { icon: Target, text: "Submit final accusation" },
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-[#05070a] relative border-t border-zinc-900/90 overflow-hidden"
    >
      {/* BACKGROUND ATMOSPHERIC NOIR ELEMENTS & PINNED SCRAPS */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {/* Subtle dark vignette & red ambient lamp reflection */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-red-950/15 rounded-full blur-[160px]" />

        {/* Top-Left Pinned Note: "IT'S NOT JUST A GAME... IT'S A CASE." */}
        <div className="hidden xl:block absolute top-12 left-10 rotate-[-6deg] z-10 pointer-events-auto">
          <div className="relative bg-[#ebe1c8]/90 text-[#1e1913] font-typewriter p-4 rounded shadow-2xl border border-[#c4b694] max-w-[190px]">
            {/* Pushpin */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_2px_6px_rgba(0,0,0,0.8)] border border-red-400" />
            <div className="text-xs uppercase font-bold tracking-tight leading-tight">
              IT&apos;S NOT
              <br />
              JUST A GAME...
              <br />
              IT&apos;S{" "}
              <span className="relative inline-block text-red-700 font-bold px-1">
                A CASE.
                <span className="absolute inset-0 border-2 border-red-600 rounded-full scale-110 -rotate-2" />
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right Chalk Steps List: "OBSERVE ANALYZE QUESTION CONNECT SOLVE" */}
        <div className="hidden xl:block absolute top-12 right-12 text-right z-10">
          <div className="font-mono text-xs tracking-[0.25em] text-zinc-400 uppercase space-y-1">
            <div className="text-zinc-300 font-semibold">OBSERVE</div>
            <div>ANALYZE</div>
            <div>QUESTION</div>
            <div>CONNECT</div>
            <div className="text-red-500 font-bold">SOLVE</div>
          </div>
          {/* Hand-drawn curved arrow SVG */}
          <svg
            className="w-16 h-14 ml-auto mt-1 text-zinc-500 opacity-60"
            viewBox="0 0 60 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 4C35 4 10 18 12 42M12 42L4 34M12 42L22 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Bottom-Left Angled Text */}
        <div className="hidden lg:block absolute bottom-12 left-10 rotate-[-4deg] font-typewriter text-xs text-zinc-400 tracking-wider">
          <div className="text-zinc-300 font-bold">SAME EVIDENCE.</div>
          <div>DIFFERENT MINDS.</div>
          <div className="text-red-500 font-semibold">WHO WILL SOLVE IT FIRST?</div>
        </div>

        {/* Bottom-Right Compass & Note */}
        <div className="hidden lg:flex items-center gap-4 absolute bottom-10 right-10 z-10 text-right">
          <div className="font-typewriter text-xs text-amber-500/90 tracking-wider">
            <div>IT ALL</div>
            <div className="font-bold text-amber-400">CONNECTS</div>
            <div>IN THE END.</div>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-amber-600/40 bg-black/60 flex items-center justify-center shadow-xl">
            <Compass className="w-8 h-8 text-amber-500/80 stroke-[1.2]" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-zinc-600">—</span>
            <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.3em] text-[#e50914] font-bold">
              HOW IT WORKS
            </span>
            <span className="text-zinc-600">—</span>
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-takeashot text-white tracking-wide uppercase leading-none">
            BECOME THE{" "}
            <span className="text-[#e50914] drop-shadow-[0_0_24px_rgba(229,9,20,0.7)]">
              DETECTIVE
            </span>
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base font-normal mt-4 leading-relaxed max-w-2xl mx-auto">
            Step into real-world inspired cases, follow the clues, connect the
            dots and uncover the truth. Every decision brings you closer to the
            culprit.
          </p>
        </div>

        {/* 5 STEPS INVESTIGATION JOURNEY WITH RED CONNECTING ARROWS */}
        <div className="relative">
          {/* DESKTOP CONNECTING RED ARROW THREADS (ABOVE CARDS) */}
          <div className="hidden lg:block absolute top-[110px] left-0 right-0 z-20 pointer-events-none">
            {/* SVG Connecting Red Lines & Arrowheads between the 5 cards */}
            <svg
              className="w-full h-12"
              viewBox="0 0 1200 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="red-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#e50914" />
                </marker>
              </defs>
              {/* String 1 -> 2 */}
              <path
                d="M 215 20 Q 235 24, 255 20"
                stroke="#e50914"
                strokeWidth="2.5"
                markerEnd="url(#red-arrow)"
                className="drop-shadow-[0_0_6px_rgba(229,9,20,0.8)]"
              />
              {/* String 2 -> 3 */}
              <path
                d="M 455 20 Q 475 16, 495 20"
                stroke="#e50914"
                strokeWidth="2.5"
                markerEnd="url(#red-arrow)"
                className="drop-shadow-[0_0_6px_rgba(229,9,20,0.8)]"
              />
              {/* String 3 -> 4 */}
              <path
                d="M 695 20 Q 715 25, 735 20"
                stroke="#e50914"
                strokeWidth="2.5"
                markerEnd="url(#red-arrow)"
                className="drop-shadow-[0_0_6px_rgba(229,9,20,0.8)]"
              />
              {/* String 4 -> 5 */}
              <path
                d="M 935 20 Q 955 17, 975 20"
                stroke="#e50914"
                strokeWidth="2.5"
                markerEnd="url(#red-arrow)"
                className="drop-shadow-[0_0_6px_rgba(229,9,20,0.8)]"
              />
            </svg>
          </div>

          {/* THE 5 RESPONSIVE STEP CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 items-start">
            {steps.map((item, idx) => (
              <div
                key={item.step}
                className="relative flex flex-col group transition-all duration-300"
              >
                {/* MOBILE / VERTICAL RED CONNECTING LINE */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-[#e50914] z-20 shadow-[0_0_8px_#e50914]" />
                )}

                {/* 1. TOP INTERACTIVE VISUAL CARD */}
                <div className="relative aspect-[4/3] w-full rounded-lg bg-[#0e131d] border border-zinc-800 shadow-2xl overflow-hidden group-hover:border-red-600/70 group-hover:shadow-[0_12px_28px_rgba(229,9,20,0.25)] transition-all duration-300">
                  {item.customCard === "interrogation" ? (
                    /* Step 04: Interrogation Dialogue Panel */
                    <div className="h-full w-full flex bg-[#0c1017]">
                      {/* Left: Suspect Photo */}
                      <div className="w-[45%] h-full relative border-r border-zinc-800">
                        <Image
                          src={item.image}
                          alt="Interrogated Suspect"
                          fill
                          className="object-cover object-top filter contrast-125 brightness-90"
                          sizes="150px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>

                      {/* Right: Interview Dialog Box matching image */}
                      <div className="w-[55%] h-full p-2.5 flex flex-col justify-between text-[10px] bg-[#10141d]/95 font-sans">
                        {/* Top Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1.5 pb-1 border-b border-zinc-800">
                            <span className="flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              INTERVIEW
                            </span>
                            <span className="text-zinc-500">✕</span>
                          </div>
                          <div className="text-zinc-200 font-medium text-[10px] leading-tight mb-2">
                            &quot;Where were you at 9:00 PM?&quot;
                          </div>

                          {/* Dialogue options */}
                          <div className="space-y-1">
                            {[
                              "I was at home.",
                              "I was with a friend.",
                              "That's not important.",
                            ].map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => setSelectedDialogue(oIdx)}
                                className={`w-full text-left px-2 py-1 rounded text-[9px] transition-all truncate ${
                                  selectedDialogue === oIdx
                                    ? "bg-zinc-800 text-white border border-red-500/70 font-semibold"
                                    : "bg-black/40 text-zinc-400 hover:text-zinc-200 border border-transparent"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Action */}
                        <div className="text-[9px] text-amber-400/90 font-mono flex items-center gap-1 border-t border-zinc-800/80 pt-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Show evidence</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Step 01, 02, 03, 05 Standard Visual Image */
                    <div className="relative w-full h-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 filter contrast-110 brightness-95 group-hover:brightness-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      />
                      {/* Subtle Dark Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Red Pin Accent on Step 02 */}
                      {idx === 1 && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_2px_8px_rgba(229,9,20,0.8)] border border-red-300" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. STEP CONTENT (BELOW CARD) */}
                <div className="mt-4 pt-1 flex flex-col space-y-2">
                  {/* Step Number */}
                  <div className="font-bebas text-2xl text-zinc-400 group-hover:text-[#e50914] transition-colors leading-none">
                    {item.step}
                  </div>

                  {/* Step Title */}
                  <h3 className="font-sans font-bold text-white text-base leading-tight">
                    {item.title}
                  </h3>

                  {/* Subtitle / Description */}
                  <p className="text-zinc-400 text-xs leading-relaxed font-sans min-h-[38px]">
                    {item.subtitle}
                  </p>

                  {/* 3 Bullets with Icons */}
                  <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-300 font-sans">
                    {item.bullets.map((b, bIdx) => {
                      const BIcon = b.icon;
                      return (
                        <div key={bIdx} className="flex items-center gap-2">
                          <BIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="text-[11px] text-zinc-300">{b.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA: START INVESTIGATING + FIRST CASE FREE */}
        <div className="mt-16 sm:mt-20 text-center flex flex-col items-center justify-center">
          <button
            onClick={onStartInvestigating}
            type="button"
            className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 text-sm sm:text-base font-bold uppercase tracking-wider text-white bg-[#e50914] hover:bg-[#ff1a25] rounded-md btn-red-glow transition-all active:scale-[0.98]"
          >
            <span>START INVESTIGATING</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>FIRST CASE FREE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
