"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Pencil, 
  MoreVertical, 
  MapPin, 
  Users, 
  Search, 
  IndianRupee,
  Calendar,
  Sparkles
} from "lucide-react";
import { CasePreviewData } from "@/lib/api/cases.api";

interface CaseHeaderProps {
  caseData: CasePreviewData;
  onTogglePublish?: () => void;
  isTogglingPublish?: boolean;
}

export default function CaseHeader({
  caseData,
  onTogglePublish,
  isTogglingPublish,
}: CaseHeaderProps) {
  const router = useRouter();

  // Metrics calculation
  const suspectsCount = caseData.suspects?.length ?? 0;
  const cluesCount = caseData.locations?.reduce(
    (acc, loc) => acc + (loc.clues?.length || 0),
    0
  ) ?? 0;
  const locationsCount = caseData.locations?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* ── Top Bar: Breadcrumb + Admin Info ── */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <Link
            href="/admin/cases"
            className="hover:text-neutral-900 transition-colors"
          >
            Cases
          </Link>
          <ChevronRight size={14} className="text-neutral-400" />
          <span className="text-neutral-800 font-semibold truncate max-w-xs sm:max-w-md">
            {caseData.title}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold text-xs">
            CA
          </div>
          <div className="hidden sm:block text-right text-xs">
            <p className="font-semibold text-neutral-900 leading-tight">CASEFILE Admin</p>
            <p className="text-neutral-400 text-[11px] leading-tight">admin@casefile.com</p>
          </div>
        </div>
      </div>

      {/* ── Main Dark Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f1115] text-white p-6 shadow-xl border border-neutral-800">
        {/* Ambient background glow */}
        <div 
          className="absolute -right-20 -top-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" 
        />
        <div 
          className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" 
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Thumbnail & Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-3xl">
            {/* Case Cover Thumbnail */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700/60 shrink-0 shadow-lg">
              {caseData.coverImageUrl ? (
                <Image
                  src={caseData.coverImageUrl}
                  alt={caseData.title}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600">
                  <Search size={28} />
                  <span className="text-[10px] mt-1 font-medium">No Cover</span>
                </div>
              )}
            </div>

            {/* Title, Status, Description & Stats */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {caseData.title}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${
                    caseData.isPublished
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  {caseData.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                {caseData.description || "No description provided for this case."}
              </p>

              {/* Badges / Metrics Row */}
              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-neutral-300 font-medium">
                {/* Price */}
                <div className="flex items-center gap-1 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700/50">
                  <span className="text-neutral-400">₹</span>
                  <span className="font-bold text-white">
                    {caseData.priceInRupees ?? (caseData.priceInPaise ? caseData.priceInPaise / 100 : 0)}
                  </span>
                </div>

                {/* Suspects */}
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Users size={14} className="text-neutral-400" />
                  <span>{suspectsCount} suspects</span>
                </div>

                {/* Clues */}
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Search size={14} className="text-neutral-400" />
                  <span>{cluesCount} clues</span>
                </div>

                {/* Locations */}
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <MapPin size={14} className="text-neutral-400" />
                  <span>{locationsCount} locations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={() => router.push(`/admin/cases/create?caseId=${caseData.id}&step=1`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-neutral-900 text-xs sm:text-sm font-semibold hover:bg-neutral-100 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Pencil size={14} className="text-neutral-800" />
              <span>Edit Case</span>
            </button>

            {onTogglePublish && (
              <button
                type="button"
                disabled={isTogglingPublish}
                onClick={onTogglePublish}
                title={caseData.isPublished ? "Unpublish Case" : "Publish Case"}
                className="p-2.5 rounded-xl bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700 active:scale-95 transition-all border border-neutral-700/60 cursor-pointer disabled:opacity-50"
              >
                <MoreVertical size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

