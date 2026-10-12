"use client";

import React from "react";
import Image from "next/image";
import { X, ShieldAlert, FileText, MapPin, CheckCircle2, ArrowRight, Lock } from "lucide-react";

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clueId: string | null;
  onLaunchCase: () => void;
}

const CASE_DATA: Record<
  string,
  {
    code: string;
    title: string;
    location: string;
    description: string;
    clue1Title: string;
    clue1Desc: string;
    clue2Title: string;
    clue2Desc: string;
    quote: string;
    isFree: boolean;
    price?: string;
    image?: string;
  }
> = {
  "case-01": {
    code: "DOSSIER #CABIN-01",
    title: "CASE 01: THE SILENT CABIN",
    location: "Blackwood Pines • Nov 3rd • 01:14 AM",
    description:
      "A weekend trip. A missing friend. Nothing adds up. Tire tracks lead into the woods, but no vehicle ever left the dirt road. The cabin door was locked from the inside.",
    clue1Title: "Locked Room Mystery",
    clue1Desc: "Deadbolt secured from within. Broken window glass found on the outside porch, not the interior floor.",
    clue2Title: "Deleted Voicemail",
    clue2Desc: "38-second recovered audio from 11:58 PM with wind rustling and a distinctive brass bell chime.",
    quote: "Why would someone stage a forced entry from the inside out? Look at the second set of footprints.",
    isFree: true,
    image: "/case_silent_cabin.jpg",
  },
  "case-02": {
    code: "DOSSIER #MOTEL-02",
    title: "CASE 02: THE RED MOTEL",
    location: "Route 66 Corridor • Oct 28th • 02:30 AM",
    description:
      "A stranger. A false identity. A night that went wrong. Room 14 was paid for in cash under an alias. At 2:30 AM, gunshots were reported under the buzzing neon sign.",
    clue1Title: "Guest Registry Carbon Copy",
    clue1Desc: "Signature matches an unsolved 2019 syndicate forgery. Phone calls made to an unlisted maritime office.",
    clue2Title: "Surveillance Rain Glare",
    clue2Desc: "Security camera feed shows a driver entering a black sedan with deliberate wipers cadence.",
    quote: "The desk clerk recognized the suspect before the shot was fired. Someone tipped him off.",
    isFree: false,
    price: "₹10",
    image: "/case_red_motel.jpg",
  },
  "case-03": {
    code: "DOSSIER #HEIR-03",
    title: "CASE 03: THE MISSING HEIR",
    location: "Kensington Estate • Sept 19th • 22:45 PM",
    description:
      "A wealthy family. A vanished heir. Secrets run deep. The sole heir to the Sterling estate disappears hours before signing the revised testamentary will.",
    clue1Title: "Torn Manuscript Fragment",
    clue1Desc: "Handwritten addendum altering beneficiary shares, discovered partially burned in the library hearth.",
    clue2Title: "Evidence Marker #3: Vintage Whiskey",
    clue2Desc: "Traces of odorless barbiturates detected along the rim of the deceased patriarch's crystal glass.",
    quote: "Follow the financial audit, not the grieving family members. Two distinct banks were authorized wire transfers that evening.",
    isFree: false,
    price: "₹20",
    image: "/case_missing_heir.jpg",
  },
  "case-04": {
    code: "DOSSIER #COURT-04",
    title: "CASE 04: THE FINAL VERDICT",
    location: "Supreme Judicial Courthouse • Aug 11th • 17:00 PM",
    description:
      "A high-profile trial. A shocking twist. Can you uncover the truth? Moments before the jury delivers their verdict, the star witness vanishes from police custody.",
    clue1Title: "Tampered Holding Cell Lock",
    clue1Desc: "Biometric override log timestamped 4 minutes prior to the scheduled court reconvene.",
    clue2Title: "Anonymous Courier Dossier",
    clue2Desc: "Photographic proof showing juror #4 meeting defense counsel at a downtown diner two nights ago.",
    quote: "Justice wasn't blind in this courtroom; it was carefully orchestrated. Locate the second exit badge.",
    isFree: false,
    price: "₹50",
    image: "/case_courthouse.jpg",
  },
};

export default function EvidenceModal({
  isOpen,
  onClose,
  clueId,
  onLaunchCase,
}: EvidenceModalProps) {
  if (!isOpen) return null;

  const currentCase =
    (clueId && CASE_DATA[clueId]) || CASE_DATA["case-01"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c1017] border border-zinc-700/80 rounded-lg shadow-2xl overflow-hidden">
        {/* Top Header bar with Manila folder tab style */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141a24] border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-wider text-red-400 font-bold">
              CLASSIFIED EVIDENCE // {currentCase.code}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Case Headline */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{currentCase.location}</span>
            </div>
            <h3 className="text-2xl font-bebas text-white tracking-wide">
              {currentCase.title}
            </h3>
            <p className="text-sm text-zinc-300 font-normal leading-relaxed mt-1">
              {currentCase.description}
            </p>
          </div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded bg-black/50 border border-zinc-800 font-mono text-xs space-y-1.5">
              <div className="text-red-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Physical Clue #01
              </div>
              <div className="text-zinc-200 font-sans font-medium text-sm">
                {currentCase.clue1Title}
              </div>
              <p className="text-zinc-400 text-[11px]">
                {currentCase.clue1Desc}
              </p>
            </div>

            <div className="p-3.5 rounded bg-black/50 border border-zinc-800 font-mono text-xs space-y-1.5">
              <div className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Forensic Analysis
              </div>
              <div className="text-zinc-200 font-sans font-medium text-sm">
                {currentCase.clue2Title}
              </div>
              <p className="text-zinc-400 text-[11px]">
                {currentCase.clue2Desc}
              </p>
            </div>
          </div>

          {/* Detective quote */}
          <div className="p-4 bg-red-950/20 border-l-4 border-red-600 rounded-r text-sm text-zinc-300 font-typewriter italic">
            &quot;{currentCase.quote}&quot;
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#10151e] border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono flex items-center gap-1.5">
            {currentCase.isFree ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Case is unlocked & free to play</span>
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Bureau Access Fee: {currentCase.price}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              Close Dossier
            </button>
            <button
              onClick={() => {
                onClose();
                onLaunchCase();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#e50914] hover:bg-[#ff1a25] btn-red-glow rounded transition-all"
            >
              <span>{currentCase.isFree ? "Begin Investigation" : `Unlock (${currentCase.price})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
