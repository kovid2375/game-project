"use client";

import Image from "next/image";
import { CasePreviewData } from "@/lib/api/cases.api";
import { 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Clock, 
  AlertCircle,
  ShieldAlert,
  Image as ImageIcon
} from "lucide-react";

interface OverviewTabProps {
  caseData: CasePreviewData;
}

export default function OverviewTab({ caseData }: OverviewTabProps) {
  const priceRupees =
    caseData.priceInRupees ??
    (caseData.priceInPaise ? caseData.priceInPaise / 100 : 0);

  const formattedCreated = caseData.createdAt
    ? new Date(caseData.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6 pt-6">
      {/* ── Row 1: The 3 Primary Cards matching User UI ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Basic Information */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900 mb-4">
              Basic Information
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start justify-between gap-4 py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Case Number</span>
                <span className="font-semibold text-neutral-900 font-mono">
                  #{caseData.caseNumber}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Title</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {caseData.title}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Price</span>
                <span className="font-semibold text-neutral-900">
                  ₹{priceRupees}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1.5">
                <span className="text-neutral-500 font-medium">Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    caseData.isPublished
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}
                >
                  {caseData.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
            <span>Created on</span>
            <span>{formattedCreated}</span>
          </div>
        </div>

        {/* Card 2: Description */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col">
          <h3 className="text-base font-bold text-neutral-900 mb-4">
            Description
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line flex-1">
            {caseData.description || (
              <span className="text-neutral-400 italic">No description entered.</span>
            )}
          </p>
        </div>

        {/* Card 3: Cover Preview */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col">
          <h3 className="text-base font-bold text-neutral-900 mb-4">
            Cover
          </h3>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/80">
            {caseData.coverImageUrl ? (
              <Image
                src={caseData.coverImageUrl}
                alt={caseData.title}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1.5">
                <ImageIcon size={28} />
                <span className="text-xs">No cover image</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Victim & Police Report (Essential Case Info) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Victim Information Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Victim Profile
              </h3>
              <p className="text-xs text-neutral-400">Deceased individual details</p>
            </div>
          </div>

          {caseData.victim ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Name</span>
                  <span className="font-semibold text-neutral-800">{caseData.victim.name}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Age</span>
                  <span className="font-semibold text-neutral-800">{caseData.victim.age} years</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Occupation</span>
                  <span className="font-semibold text-neutral-800">{caseData.victim.occupation}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Place of Death</span>
                  <span className="font-semibold text-neutral-800">{caseData.victim.placeOfDeath}</span>
                </div>
              </div>

              {caseData.victim.dateOfDeath && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 pt-1">
                  <Calendar size={13} className="text-neutral-400" />
                  <span>
                    Date of Death:{" "}
                    <strong className="font-medium text-neutral-700">
                      {new Date(caseData.victim.dateOfDeath).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                </div>
              )}

              {caseData.victim.biography && (
                <div className="pt-2 text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <span className="font-semibold text-neutral-700 block mb-1">Biography / Notes:</span>
                  {caseData.victim.biography}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-neutral-400 text-xs">
              No victim details configured for this case yet.
            </div>
          )}
        </div>

        {/* Police Incident Report */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Initial Police Report
              </h3>
              <p className="text-xs text-neutral-400">Official precinct initial findings</p>
            </div>
          </div>

          {caseData.policeReport ? (
            <div className="space-y-3.5 text-sm">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Cause of Death
                </span>
                <p className="font-semibold text-neutral-800">
                  {caseData.policeReport.causeOfDeath || "Pending toxicology / autopsy"}
                </p>
              </div>

              {caseData.policeReport.officerNotes && (
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    Officer Notes
                  </span>
                  <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                    {caseData.policeReport.officerNotes}
                  </p>
                </div>
              )}

              {(caseData.policeReport.timeOfDeathStart || caseData.policeReport.timeOfDeathEnd) && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                  <Clock size={13} className="text-neutral-400" />
                  <span>
                    Estimated TOD: {caseData.policeReport.timeOfDeathStart || "—"} to{" "}
                    {caseData.policeReport.timeOfDeathEnd || "—"}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-neutral-400 text-xs">
              No police report recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

