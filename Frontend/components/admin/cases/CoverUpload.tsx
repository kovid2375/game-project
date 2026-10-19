"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface CoverUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadFile: (file: File) => Promise<{ url?: string; error?: string }>;
}

export default function CoverUpload({
  value,
  onChange,
  onUploadFile,
}: CoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Only JPG, PNG, and WebP images are supported.");
      return;
    }

    // Validate size (5MB max as per backend ParseFilePipeBuilder)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const result = await onUploadFile(file);

    setIsUploading(false);
    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      onChange(result.url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
          Cover Image <span className="text-red-500">*</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
          >
            Remove Image
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div className="relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-900 group aspect-video max-h-56 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Case Cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-neutral-900 text-xs font-semibold rounded-lg shadow-md hover:bg-neutral-100 cursor-pointer"
            >
              Change Image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isUploading
              ? "bg-neutral-50 border-neutral-300"
              : "border-neutral-200 bg-neutral-50/60 hover:bg-red-50/30 hover:border-red-300"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 text-neutral-500 gap-2">
              <Loader2 size={28} className="animate-spin text-red-600" />
              <p className="text-xs font-medium text-neutral-600">
                Uploading cover to Cloudinary…
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-700">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  JPG, PNG, or WebP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600 font-medium">{uploadError}</p>
      )}
    </div>
  );
}
