"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import CoverUpload from "./CoverUpload";
import { AdminCase, CreateCasePayload, UpdateCasePayload } from "@/lib/api/cases.api";

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem?: AdminCase | null;
  onSave: (
    data: CreateCasePayload | UpdateCasePayload,
  ) => Promise<{ success: boolean; error?: string }>;
  onUploadFile: (file: File) => Promise<{ url?: string; error?: string }>;
}

export default function CaseModal({
  isOpen,
  onClose,
  caseItem,
  onSave,
  onUploadFile,
}: CaseModalProps) {
  const isEditing = Boolean(caseItem);

  const [caseNumber, setCaseNumber] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [priceInRupees, setPriceInRupees] = useState<number | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (caseItem) {
      setCaseNumber(caseItem.caseNumber);
      setTitle(caseItem.title);
      setDescription(caseItem.description);
      setCoverImageUrl(caseItem.coverImageUrl);
      setPriceInRupees(caseItem.priceInRupees ?? (caseItem.priceInPaise ? caseItem.priceInPaise / 100 : 0));
    } else {
      setCaseNumber("");
      setTitle("");
      setDescription("");
      setCoverImageUrl("");
      setPriceInRupees(0);
    }
    setFormError(null);
  }, [caseItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validations
    if (caseNumber === "" || Number(caseNumber) < 1) {
      setFormError("Case number must be a positive integer.");
      return;
    }
    if (!title.trim() || title.length < 3 || title.length > 120) {
      setFormError("Title must be between 3 and 120 characters.");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setFormError("Description must be at least 10 characters.");
      return;
    }
    if (!coverImageUrl.trim()) {
      setFormError("Please upload a case cover image.");
      return;
    }
    if (priceInRupees === "" || Number(priceInRupees) < 0) {
      setFormError("Price in Rupees cannot be negative.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      caseNumber: Number(caseNumber),
      title: title.trim(),
      description: description.trim(),
      coverImageUrl: coverImageUrl.trim(),
      priceInRupees: Number(priceInRupees),
    };

    const res = await onSave(payload);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setFormError(res.error || "Failed to save case. Please check your inputs.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {isEditing ? `Edit Case #${caseItem?.caseNumber}` : "Create New Case"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isEditing
                ? "Update case details and cover image."
                : "Fill in the details below to add a mystery game case."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-600 font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Case Number & Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Case Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={caseNumber}
                onChange={(e) =>
                  setCaseNumber(e.target.value === "" ? "" : parseInt(e.target.value, 10))
                }
                placeholder="e.g. 1"
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Price (INR ₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  required
                  value={priceInRupees}
                  onChange={(e) =>
                    setPriceInRupees(
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                  placeholder="0 (Free)"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-mono"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Enter 0 for free cases.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Mystery of Room 404"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief thriller synopsis explaining the crime or mystery..."
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 resize-none"
            />
          </div>

          {/* Cover Upload */}
          <CoverUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            onUploadFile={onUploadFile}
          />

          {/* Modal Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-500/20 transition-all cursor-pointer"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Case"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
