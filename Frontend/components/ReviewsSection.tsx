"use client";

import React from "react";
import { Star, ShieldCheck, Quote, Sparkles } from "lucide-react";
import DriftWall from "./DriftWall";

export default function ReviewsSection() {
  const reviewItems = [
    {
      author: "Special Agent R. Vance",
      role: "Forensic Investigator",
      rating: 5,
      badge: "CASE #01 SOLVED",
      review:
        "The tension of examining conflicting testimonies and forensic timelines is unmatched. The Pier 9 mystery had my squad hooked for hours.",
    },
    {
      author: "Elena Rostova",
      role: "True Crime Host",
      rating: 5,
      badge: "5/5 MASTERPIECE",
      review:
        "Listening to 911 dispatch calls, spotting timeline gaps in toll receipts, and connecting pushpins on the wall. Hands down the most immersive detective game.",
    },
    {
      author: "Marcus & Maya Chen",
      role: "Co-op Sleuths",
      rating: 5,
      badge: "TOP 2% SLEUTHS",
      review:
        "Played over Discord with our friend group. The moment we caught the witness lying about the watch timestamp gave us chills!",
    },
    {
      author: "Chief Det. Callahan",
      role: "Cold Case Division",
      rating: 5,
      badge: "EXPERT SOLVE",
      review:
        "Realistic ballistics and autopsy reports. No hand-holding hints. You actually have to deduce the motive and timeline yourself.",
    },
    {
      author: "Dr. Aris Thorne",
      role: "Forensic Pathologist",
      rating: 5,
      badge: "CASE #03 VERDICT",
      review:
        "The chemical toxicology reports and blood evidence are shockingly accurate. Pure deduction perfection.",
    },
    {
      author: "Sarah Lindqvist",
      role: "Mystery Novelist",
      rating: 5,
      badge: "FLAWLESS LOGIC",
      review:
        "Brilliant storytelling. The suspect in The Red Motel had an alibi that seemed airtight until we cross-examined the rain radar.",
    },
    {
      author: "David & Leo Ross",
      role: "Armchair Sleuths",
      rating: 5,
      badge: "38 MIN SOLVE",
      review:
        "The interactive interrogation dialogue felt like a real police interview. Caught the suspect tripping over his own timeline.",
    },
    {
      author: "Inspector Gomez",
      role: "Metro Bureau",
      rating: 5,
      badge: "BUREAU VERIFIED",
      review:
        "Clean UI, gritty noir atmosphere, and real investigative depth. This is what modern detective gaming should feel like.",
    },
    {
      author: "Kaitlyn Wright",
      role: "Puzzle Enthusiast",
      rating: 5,
      badge: "CASE #02 CRACKED",
      review:
        "Connecting the red yarn strings across suspect alibis and security camera timestamps on the corkboard was deeply satisfying.",
    },
    {
      author: "Victor 'Ghost' S.",
      role: "Cyber Investigator",
      rating: 5,
      badge: "LEADERBOARD #12",
      review:
        "The Ghost Protocol case forced us to decrypt biometric logs and compare courier receipts. Absolutely phenomenal design.",
    },
    {
      author: "Morgan Reed",
      role: "True Crime Sleuth",
      rating: 5,
      badge: "VERIFIED SLEUTH",
      review:
        "Free first case blew my expectations away. It didn’t hold back on difficulty or complexity. Instant all-access pass buyer.",
    },
    {
      author: "Nora & Sam Patel",
      role: "Weekend Detectives",
      rating: 5,
      badge: "CASE #04 SOLVED",
      review:
        "The courthouse trial twist was genuinely unexpected. We had our suspect board set up and were completely blown away.",
    },
    {
      author: "Agent J. Bishop",
      role: "Criminal Profiler",
      rating: 5,
      badge: "99% DEDUCTION",
      review:
        "Psychological profiles of the suspects felt genuinely three-dimensional. Every interrogation choice had genuine weight.",
    },
    {
      author: "Lucas Moreau",
      role: "Noir Film Critic",
      rating: 5,
      badge: "TOP REVIEWER",
      review:
        "Atmospheric perfection. From the typewriter notes to the vintage desk lamp glow and authentic crime photography.",
    },
    {
      author: "Zack & Team Alpha",
      role: "Speedrun Squad",
      rating: 5,
      badge: "24 MIN RECORD",
      review:
        "Competitive leaderboard rush is intense! Cross-referencing evidence as a team in real-time is peak mystery gaming.",
    },
  ];

  return (
    <section
      id="reviews"
      className="py-24 bg-[#07090d] relative border-t border-zinc-900 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-950/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-md">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-300 font-semibold">
              4.9/5 OVERALL RATING ACROSS 18,000+ DETECTIVES
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-takeashot text-white tracking-wide mt-2">
            WHAT INVESTIGATORS ARE SAYING
          </h2>
          <p className="text-zinc-400 text-sm mt-3 font-sans leading-relaxed">
            Hover over any dossier to inspect real player verdicts, case ratings,
            and testimonials from our global investigative syndicate.
          </p>
        </div>

        {/* 3D DRIFT WALL CONTAINER (HEIGHT: 600) */}
        <div className="relative w-full rounded-2xl bg-[#05070a]  overflow-hidden">
          {/* Top & Bottom Cinematic Fade Vignettes */}
          <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-[#05070a] to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#05070a] to-transparent z-20 pointer-events-none" />

          {/* DriftWall Instance matching user configuration with review cards */}
          <div style={{ height: 600 }}>
            <DriftWall
              items={reviewItems}
              columns={5}
              tileWidth={210}
              tileHeight={134}
              gap={18}
              tilt={16}
              turn={-14}
              perspective={1200}
              depth={120}
              speed={42}
              direction="up"
              variance={0.45}
              parallax={0.6}
              lift={64}
              fade={0.6}
              dim={0.68}
              overlayColor="#060010"
              radius={14}
              roll={0}
              pauseOnHover={false}
              grayscale={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
