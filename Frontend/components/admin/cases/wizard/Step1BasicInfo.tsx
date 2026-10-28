"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon, ArrowRight } from "lucide-react";
import { CreateCasePayload, UpdateCasePayload } from "@/lib/api/cases.api";

export interface Step1FormData {
  caseNumber: number | "";
  title: string;
  description: string;
  priceInRupees: number | "";
  coverImageUrl: string;
}

interface Step1BasicInfoProps {
  initialData?: Partial<Step1FormData>;
  isEditing?: boolean;
  onSubmit: (data: Step1FormData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  onUploadCover: (file: File) => Promise<{ url?: string; error?: string }>;
}

export default function Step1BasicInfo({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  onUploadCover,
}: Step1BasicInfoProps) {
  const [caseNumber, setCaseNumber] = useState<number | "">(
    initialData?.caseNumber ?? 1
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [priceInRupees, setPriceInRupees] = useState<number | "">(
    initialData?.priceInRupees ?? 0
  );
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImageUrl ?? ""
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Only JPG, PNG, and WebP images are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const result = await onUploadCover(file);
    setIsUploading(false);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      setCoverImageUrl(result.url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (caseNumber === "" || Number(caseNumber) < 1) {
      setFormError("Case number must be a positive integer.");
      return;
    }
    if (!title.trim() || title.length < 3 || title.length > 120) {
      setFormError("Case title must be between 3 and 120 characters.");
      return;
    }
    if (priceInRupees === "" || Number(priceInRupees) < 0) {
      setFormError("Price cannot be negative.");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setFormError("Description must be at least 10 characters.");
      return;
    }
    if (description.length > 1000) {
      setFormError("Description cannot exceed 1000 characters.");
      return;
    }
    if (!coverImageUrl.trim()) {
      setFormError("Please upload a case cover image.");
      return;
    }

    setIsSubmitting(true);
    const res = await onSubmit({
      caseNumber: Number(caseNumber),
      title: title.trim(),
      priceInRupees: Number(priceInRupees),
      description: description.trim(),
      coverImageUrl: coverImageUrl.trim(),
    });
    setIsSubmitting(false);

    if (!res.success && res.error) {
      setFormError(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{formError}</span>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Main card grid */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Title, Price, Case Number, Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Case Title */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-neutral-800">
                  Case Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter case title"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                />
                <span className="text-[11px] text-neutral-400 block">
                  {title.length}/120 characters
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-800">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="0"
                  value={priceInRupees}
                  onChange={(e) =>
                    setPriceInRupees(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
                />
                <span className="text-[11px] text-neutral-400 block">
                  Set 0 for free case
                </span>
              </div>
            </div>

            {/* Case Number */}
            <div className="w-full sm:w-1/2 space-y-2">
              <label className="block text-xs font-semibold text-neutral-800">
                Case Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 1"
                value={caseNumber}
                onChange={(e) =>
                  setCaseNumber(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
              />
              <span className="text-[11px] text-neutral-400 block">
                Official detective case number
              </span>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-800">
                  Short Description <span className="text-red-500">*</span>
                </label>
              </div>
              <textarea
                rows={4}
                required
                maxLength={1000}
                placeholder="A brief description shown to players (max 1000 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none resize-none"
              />
              <div className="flex justify-end">
                <span className="text-[11px] text-neutral-400">
                  {description.length}/1000
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Cover Image Upload */}
          <div className="space-y-2 flex flex-col">
            <label className="block text-xs font-semibold text-neutral-800">
              Cover Image <span className="text-red-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`flex-1 min-h-[220px] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center ${
                coverImageUrl
                  ? "border-neutral-200 bg-neutral-900 overflow-hidden relative group p-0"
                  : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              {coverImageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Case Cover Preview"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2.5 z-20">
                      <Loader2 size={32} className="animate-spin text-red-500" />
                      <p className="text-xs font-semibold text-white tracking-wide">
                        Uploading cover…
                      </p>
                    </div>
                  )}

                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold shadow hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageUrl("");
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400 shadow-2xs">
                    {isUploading ? (
                      <Loader2 size={24} className="animate-spin text-red-600" />
                    ) : (
                      <ImageIcon size={26} strokeWidth={1.5} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-700">
                      Upload cover image
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={13} />
                    <span>Browse file</span>
                  </button>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-xs text-red-600 font-medium">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
