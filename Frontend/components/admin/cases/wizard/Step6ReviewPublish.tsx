"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Globe,
  Lock,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Layers,
  MapPin,
  Users,
  Tag,
  FileText,
  User,
  Sparkles,
  Info,
} from "lucide-react";
import {
  AdminCase,
  CaseValidationResponse,
  casesApi,
} from "@/lib/api/cases.api";

interface Step6ReviewPublishProps {
  caseId: string;
  draftData?: {
    caseData?: any;
    victim?: any;
    policeReport?: any;
  };
  onSaveFinalBundle?: (bundle: any, publish: boolean) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  onPublished: () => void;
}

export default function Step6ReviewPublish({
  caseId,
  draftData,
  onSaveFinalBundle,
  onBack,
  onPublished,
}: Step6ReviewPublishProps) {
  const isDraftMode = caseId === "draft" || !caseId;
  const [caseData, setCaseData] = useState<AdminCase | null>(null);
  const [validation, setValidation] = useState<CaseValidationResponse | null>(
    null
  );
  const [preview, setPreview] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setActionError(null);

      if (isDraftMode) {
        // Construct in-memory preview for draft mode
        setCaseData({
          id: "draft",
          caseNumber: draftData?.caseData?.caseNumber || 1,
          title: draftData?.caseData?.title || "Untitled Case",
          description: draftData?.caseData?.description || "",
          coverImageUrl: draftData?.caseData?.coverImageUrl || "",
          priceInPaise: (draftData?.caseData?.priceInRupees || 0) * 100,
          priceInRupees: draftData?.caseData?.priceInRupees || 0,
          isPublished: false,
          createdAt: new Date().toISOString(),
        });
        setPreview({
          victim: draftData?.victim,
          policeReport: draftData?.policeReport,
          locations: [],
          suspects: [],
        });
        setValidation({
          caseId: "draft",
          caseNumber: draftData?.caseData?.caseNumber || 1,
          title: draftData?.caseData?.title || "Draft Case",
          readyToPublish: true,
          errors: [],
          warnings: ["Case will be created in database upon clicking Save Case."],
        });
      } else {
        const [cData, valRes, prevRes] = await Promise.all([
          casesApi.getCase(caseId),
          casesApi.validateCase(caseId).catch(() => null),
          casesApi.getCasePreview(caseId).catch(() => null),
        ]);

        setCaseData(cData);
        setValidation(valRes);
        setPreview(prevRes);
      }
    } catch (err: any) {
      console.error("Failed to load review data:", err);
      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load case validation review."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  // Handle Publish / Unpublish or Save Case in draft mode
  const handleTogglePublish = async () => {
    setIsPublishing(true);
    setActionError(null);

    try {
      if (isDraftMode && onSaveFinalBundle) {
        // Save the entire bundle into database atomically
        const res = await onSaveFinalBundle({}, true);
        if (!res.success) {
          setActionError(res.error || "Failed to save case.");
          setIsPublishing(false);
          return;
        }
        setPublishSuccess(true);
        return;
      }

      if (!caseData) return;
      const targetState = !caseData.isPublished;

      await casesApi.setPublished(caseId, targetState);
      setCaseData((prev) => (prev ? { ...prev, isPublished: targetState } : prev));
      if (targetState) {
        setPublishSuccess(true);
      }
    } catch (err: any) {
      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update published status."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 size={32} className="animate-spin text-red-600" />
        <p className="text-xs text-neutral-500 font-medium">
          Running case authoring integrity validation & compiling dossier...
        </p>
      </div>
    );
  }

  const isReady = validation?.readyToPublish ?? false;
  const hasErrors = (validation?.errors?.length ?? 0) > 0;
  const hasWarnings = (validation?.warnings?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* ── Status Alert / Success Banner ── */}
      {publishSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Case Published Successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                This case is now live and available in the Detective Game Catalog for players.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onPublished}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition-colors cursor-pointer"
          >
            View Cases Catalog
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle size={15} className="shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Top Overview Banner: Case Details & Publication State ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-200 shadow-md">
            {caseData?.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={caseData.coverImageUrl}
                alt={caseData.title}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                #{caseData?.caseNumber}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100">
                Case #{caseData?.caseNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                  caseData?.isPublished
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    caseData?.isPublished ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>{caseData?.isPublished ? "Published (Live)" : "Draft"}</span>
              </span>
            </div>

            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              {caseData?.title}
            </h2>
            <p className="text-xs text-neutral-500 line-clamp-1">
              {caseData?.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isPublishing || (!caseData?.isPublished && !isReady)}
            onClick={handleTogglePublish}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              caseData?.isPublished
                ? "bg-neutral-800 hover:bg-neutral-900 text-white"
                : "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
            }`}
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : caseData?.isPublished ? (
              <>
                <Lock size={15} />
                <span>Unpublish Case</span>
              </>
            ) : (
              <>
                <Globe size={15} />
                <span>Publish Case Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Validation Checklist & Content Summary Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Integrity Checklist (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-600" />
              <h3 className="text-sm font-bold text-neutral-900">
                Publishing Readiness Checklist
              </h3>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isReady
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isReady ? "Ready to Publish" : "Requires Attention"}
            </span>
          </div>

          {/* Validation Errors */}
          {hasErrors && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle size={14} />
                <span>Blocking Issues ({validation?.errors.length})</span>
              </p>
              <div className="space-y-1.5">
                {validation?.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-red-800 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Recommended Improvements ({validation?.warnings.length})</span>
              </p>
              <div className="space-y-1.5">
                {validation?.warnings.map((warn, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-800 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasErrors && !hasWarnings && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                All core mystery elements verified! This case meets all publication standards.
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Case Components Summary (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">
              Compiled Case Dossier Assets
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">
              Authoring Summary
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Victim */}
            <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">
                  {preview?.victim?.name || "Not Configured"}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  {preview?.victim ? "Victim Profile" : "Missing"}
                </p>
              </div>
            </div>

            {/* Locations */}
            <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {preview?.locations?.length || 0} Venues
                </p>
                <p className="text-[11px] text-neutral-500">
                  Crime Scenes
                </p>
              </div>
            </div>

            {/* Suspects */}
            <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {preview?.suspects?.length || 0} Suspects
                </p>
                <p className="text-[11px] text-neutral-500">
                  Persons of Interest
                </p>
              </div>
            </div>

            {/* Clues */}
            <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {preview?.locations?.reduce(
                    (acc: number, l: any) => acc + (l.clues?.length || 0),
                    0
                  ) || 0} Clues
                </p>
                <p className="text-[11px] text-neutral-500">
                  Physical Evidence
                </p>
              </div>
            </div>
          </div>

          {/* Solution Culprit Card */}
          {preview?.solution && (
            <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-red-400 font-bold uppercase tracking-wider">
                  Guilty Culprit
                </span>
                <span className="text-neutral-400">
                  Accusation Match: Active
                </span>
              </div>
              <p className="text-xs font-semibold">
                Culprit: {preview.suspects?.find((s: any) => s.id === preview.solution.correctSuspectId)?.name || "Assigned"}
              </p>
              <p className="text-[11px] text-neutral-400 italic line-clamp-2">
                Motive: &ldquo;{preview.solution.motive}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Clues & Evidence</span>
        </button>

        <button
          type="button"
          onClick={onPublished}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
        >
          <span>Return to Cases List</span>
        </button>
      </div>
    </div>
  );
}
