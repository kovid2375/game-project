"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight, Mail, ArrowRight } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("01");

  const leftColumnFaqs: FaqItem[] = [
    {
      id: "01",
      question: "What is CASEFILE?",
      answer:
        "CASEFILE is an online detective game where you step into real-world inspired crime cases. You examine evidence, explore locations, question suspects and connect the clues to find the criminal. Each case is a unique story with immersive visuals, challenging puzzles and a final revelation.",
    },
    {
      id: "02",
      question: "How many cases are available?",
      answer:
        "We currently feature 12 complete full-length investigative dossiers across multiple difficulty tiers—ranging from cold case homicides to financial syndicate conspiracies, with new cases released each month.",
    },
    {
      id: "03",
      question: "Is the first case free?",
      answer:
        "Yes! Case #01: The Docks Murders is 100% free to play from start to finish. No credit card, no paywalls, and no hidden subscriptions required to crack your first mystery.",
    },
    {
      id: "04",
      question: "How much do the paid cases cost?",
      answer:
        "Individual paid cases range from $4.99 to $8.99 for standalone lifetime access, or you can unlock the All-Access Bureau Pass for full clearance to every current and future case.",
    },
  ];

  const rightColumnFaqs: FaqItem[] = [
    {
      id: "05",
      question: "Do I need to create an account?",
      answer:
        "You can inspect initial teaser evidence as a guest, but creating a free Detective Bureau account is required to save game progress, notes, pinned boards, and qualify for global case leaderboards.",
    },
    {
      id: "06",
      question: "Can I play with my friends?",
      answer:
        "Absolutely. Casefile features collaborative multiplayer squad sessions. Generate an encrypted Room Code, share the live case board, and cross-reference testimonies with friends in real time over voice chat.",
    },
    {
      id: "07",
      question: "Are the cases based on real events?",
      answer:
        "Our cases are heavily inspired by authentic forensic archives, declassified FBI & Scotland Yard procedural methodology, and true crime psychology, crafted with meticulous realistic documentation.",
    },
    {
      id: "08",
      question: "How does the leaderboard work?",
      answer:
        "Detectives are scored on time-to-conviction, deduction accuracy, minimization of false leads, and bonus forensic questions. Solve cases without hint assists to climb the Hall of Inspectors.",
    },
    {
      id: "09",
      question: "Can I play on mobile?",
      answer:
        "Yes! The Casefile investigation portal is responsive across modern smartphones, iPads, tablets, and laptops—allowing you to inspect suspect audio transcripts and photos anywhere.",
    },
  ];

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const renderFaqCard = (faq: FaqItem) => {
    const isOpen = openId === faq.id;

    return (
      <div
        key={faq.id}
        className={`rounded-xl transition-all duration-300 border ${
          isOpen
            ? "bg-[#0b0f16]/90 border-red-500/50 shadow-[0_10px_35px_-8px_rgba(229,9,20,0.25)]"
            : "bg-[#080c14]/75 border-zinc-800/80 hover:border-zinc-700/80 hover:bg-[#0c1018]/85"
        } backdrop-blur-md overflow-hidden`}
      >
        <button
          type="button"
          onClick={() => toggleAccordion(faq.id)}
          className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 group cursor-pointer transition-colors"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Number Identifier */}
            <span
              className={`font-typewriter text-sm sm:text-base tracking-widest font-semibold transition-colors duration-200 ${
                isOpen ? "text-zinc-200" : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            >
              {faq.id}
            </span>

            {/* Vertical Red Accent Divider */}
            <span className="w-[1.5px] h-4 bg-red-600/75 shrink-0" />

            {/* Question Title */}
            <span
              className={`text-sm sm:text-[15px] font-sans font-medium tracking-tight transition-colors duration-200 truncate ${
                isOpen ? "text-white" : "text-zinc-300 group-hover:text-white"
              }`}
            >
              {faq.question}
            </span>
          </div>

          {/* Indicator Icon */}
          <div className="shrink-0 pl-2">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-red-500 transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200" />
            )}
          </div>
        </button>

        {/* Accordion Expandable Content */}
        {isOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50">
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed tracking-normal pl-[2.85rem]">
              {faq.answer}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      id="faq"
      className="relative w-full py-28 overflow-hidden bg-[#05070a] text-white selection:bg-red-600/30 selection:text-red-200 border-t border-zinc-900"
    >
      {/* Cinematic Noir Detective Desk Background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="/faq_detective_desk.jpg"
          alt="Detective Investigation Desk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 filter contrast-110 brightness-95"
        />

        {/* Soft vignette to blend section borders without hiding desk details */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070a] via-transparent to-[#05070a] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070a]/40 via-transparent to-[#05070a]/40" />

        {/* Subtle Warm Desk Lamp Glow at top-left */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-amber-500/15 blur-[120px]" />
        {/* Subtle Crimson Ambient Glow at center */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-72 rounded-full bg-red-600/10 blur-[140px]" />
      </div>

      {/* Decorative Handwritten Slogans matching the poster style */}
      <div className="absolute top-16 left-6 lg:left-14 hidden md:flex flex-col items-start -rotate-6 pointer-events-none select-none z-10 opacity-70">
        <span className="font-typewriter text-xs text-zinc-400 tracking-widest uppercase">
          CURIOUS
        </span>
        <span className="font-typewriter text-xs text-zinc-400 tracking-widest uppercase">
          QUESTIONS.
        </span>
        <span className="font-typewriter text-xs text-zinc-300 tracking-widest uppercase mt-1">
          CLEAR
        </span>
        <span className="font-typewriter text-xs text-zinc-300 tracking-widest uppercase">
          ANSWERS.
        </span>
        <div className="w-16 h-[1.5px] bg-red-600/80 mt-1" />
      </div>

      <div className="absolute top-20 right-6 lg:right-14 hidden lg:flex flex-col items-end rotate-3 pointer-events-none select-none z-10 opacity-60 text-right">
        <span className="font-typewriter text-[11px] text-zinc-400 tracking-wider uppercase">
          SAME
        </span>
        <span className="font-typewriter text-[11px] text-zinc-400 tracking-wider uppercase">
          EVIDENCE.
        </span>
        <span className="font-typewriter text-[11px] text-red-400 tracking-wider uppercase mt-1 font-semibold">
          DIFFERENT
        </span>
        <span className="font-typewriter text-[11px] text-red-400 tracking-wider uppercase font-semibold">
          MINDS.
        </span>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* FAQ Tag with horizontal lines */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-red-600/70" />
            <span className="font-mono text-xs sm:text-[13px] tracking-[0.35em] text-red-500 font-semibold uppercase">
              F A Q
            </span>
            <span className="w-12 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-red-600/70" />
          </div>

          {/* Main Title: QUESTIONS ON YOUR MIND? */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-takeashot tracking-wide text-white uppercase drop-shadow-md">
            QUESTIONS ON{" "}
            <span className="text-red-600 font-takeashot font-normal tracking-wide drop-shadow-[0_4px_16px_rgba(229,9,20,0.55)]">
              YOUR MIND?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-zinc-400 text-sm sm:text-base mt-4 font-sans max-w-xl mx-auto leading-relaxed">
            Everything you need to know before you start investigating.
          </p>
        </div>

        {/* 2-Column FAQ Grid matching reference layout (01-04 on left, 05-09 on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
          {/* Left Column (01 - 04) */}
          <div className="space-y-4">
            {leftColumnFaqs.map((faq) => renderFaqCard(faq))}
          </div>

          {/* Right Column (05 - 09) */}
          <div className="space-y-4">
            {rightColumnFaqs.map((faq) => renderFaqCard(faq))}
          </div>
        </div>

        {/* Bottom Callout: "Still have a question?" */}
        <div className="mt-14 max-w-2xl mx-auto">
          <div className="relative rounded-2xl bg-[#090d14]/90 border border-zinc-800/80 p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-4 text-left w-full sm:w-auto">
              {/* Mail Icon with Notification Badge */}
              <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-zinc-300" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#090d14] shadow-sm">
                  1
                </span>
              </div>

              <div>
                <h4 className="text-base font-serif font-semibold text-white tracking-wide">
                  Still have a question?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  We&apos;re here to help. Reach out to our support team.
                </p>
              </div>
            </div>

            {/* Red Bordered Action Button */}
            <a
              href="mailto:support@casefile.game"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-red-600/80 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 group whitespace-nowrap cursor-pointer shadow-[0_0_15px_-3px_rgba(229,9,20,0.3)]"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
