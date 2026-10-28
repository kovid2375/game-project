"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { AdminCase, CaseValidationResponse, casesApi } from "@/lib/api/cases.api";

interface PublishCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: AdminCase | null;
  onConfirmPublish: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PublishCaseModal({
  isOpen,
  onClose,
  caseItem,
  onConfirmPublish,
}: PublishCaseModalProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [validation, setValidation] = useState<CaseValidationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    if (isOpen && caseItem) {
      runValidation(caseItem.id);
    } else {
      setValidation(null);
      setPreview(null);
      setErrorMessage(null);
    }
  }, [isOpen, caseItem]);

  const runValidation = async (id: string) => {
    try {
      setIsValidating(true);
      setErrorMessage(null);
      const [valRes, prevRes] = await Promise.all([
        casesApi.validateCase(id),
        casesApi.getCasePreview(id).catch(() => null),
      ]);
      setValidation(valRes);
      setPreview(prevRes);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Failed to validate case."
      );
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen || !caseItem) return null;

  // Criteria evaluation for the checklist UI matching reference:
  // 1. All required information is complete (Title, Description, Cover, Victim, Police Report)
  const isBasicInfoComplete = Boolean(
    caseItem.title?.trim() &&
    caseItem.description?.trim() &&
    caseItem.coverImageUrl?.trim() &&
    preview?.victim &&
    preview?.policeReport?.causeOfDeath?.trim() &&
    preview?.policeReport?.officerNotes?.trim()
  );

  // 2. At least one suspect added (Backend requires at least 2)
  const hasSuspects = Boolean(
    preview ? preview.suspects?.length >= 2 : !validation?.errors.some(e => e.includes("suspect"))
  );

  // 3. At least one clue added
  const cluesCount = preview?.locations?.reduce(
    (acc: number, loc: any) => acc + (loc.clues?.length || 0),
    0
  ) ?? 0;
  const hasClues = cluesCount > 0 || !validation?.errors.some(e => e.includes("clue"));

  // 4. Solution configured
  const hasSolution = Boolean(
    preview?.solution?.correctSuspectId &&
    preview?.solution?.motive?.trim() &&
    preview?.solution?.method?.trim() &&
    preview?.solution?.explanation?.trim()
  ) || !validation?.errors.some(e => e.includes("Solution") || e.includes("solution"));

  const isReadyToPublish = validation?.readyToPublish ?? false;

  const handlePublish = async () => {
    if (!isReadyToPublish) return;
    setIsPublishing(true);
    setErrorMessage(null);
    const result = await onConfirmPublish(caseItem.id);
    setIsPublishing(false);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || "Failed to publish case.");
    }
  };

  const checklist = [
    {
      id: "info",
      label: "All required information is complete",
      isComplete: isBasicInfoComplete,
    },
    {
      id: "suspects",
      label: "At least two suspects added",
      isComplete: hasSuspects,
    },
    {
      id: "clues",
      label: "At least one clue added",
      isComplete: hasClues,
    },
    {
      id: "solution",
      label: "Solution configured",
      isComplete: hasSolution,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-neutral-100 max-w-md w-full overflow-hidden p-6 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
          Publish Case
        </h3>

        {/* Modal Subtitle / Question */}
        <p className="text-sm font-semibold text-neutral-800 mt-2 leading-snug">
          Are you sure you want to publish &ldquo;{caseItem.title}&rdquo;?
        </p>
        <p className="text-xs text-neutral-400 mt-0.5 leading-normal">
          Once published, this case will be visible to all players.
        </p>

        {/* Validation Checklist / Loader */}
        <div className="mt-5 space-y-3">
          {isValidating ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-neutral-400">
              <Loader2 size={24} className="animate-spin text-red-600" />
              <span className="text-xs font-medium">Validating case requirements…</span>
            </div>
          ) : (
            <>
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5">
                  {item.isComplete ? (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500 fill-emerald-50 shrink-0"
                    />
                  ) : (
                    <XCircle
                      size={18}
                      className="text-red-500 fill-red-50 shrink-0"
                    />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      item.isComplete ? "text-neutral-700" : "text-neutral-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}

              {/* Show errors list if any */}
              {validation?.errors && validation.errors.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle size={14} />
                    <span>Incomplete Requirements:</span>
                  </div>
                  <ul className="text-[11px] text-red-600 space-y-0.5 list-disc pl-5">
                    {validation.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {errorMessage && (
            <p className="text-xs text-red-600 font-medium mt-2">{errorMessage}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {!isReadyToPublish && !isValidating ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/admin/cases/create?caseId=${caseItem.id}&step=1`);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Complete Setup</span>
              <ExternalLink size={12} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!isReadyToPublish || isPublishing || isValidating}
              onClick={handlePublish}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isPublishing && <Loader2 size={13} className="animate-spin" />}
              <span>Publish Case</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

