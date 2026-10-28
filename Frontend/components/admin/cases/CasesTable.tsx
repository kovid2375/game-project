"use client";

import { useState } from "react";
import {
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FolderOpen,
  CheckCircle2,
  CircleDashed,
  IndianRupee,
} from "lucide-react";
import { AdminCase, AdminCasesPagination } from "@/lib/api/cases.api";
import PublishCaseModal from "./PublishCaseModal";

interface CasesTableProps {
  cases: AdminCase[];
  pagination: AdminCasesPagination | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  onPageChange: (page: number) => void;
  onViewCase?: (item: AdminCase) => void;
  onEditCase: (item: AdminCase) => void;
  onDeleteCase: (item: AdminCase) => void;
  onTogglePublish: (id: string, isPublished: boolean) => Promise<{ success: boolean; error?: string }>;
  onRetry: () => void;
}

export default function CasesTable({
  cases,
  pagination,
  isLoading,
  error,
  page,
  onPageChange,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onTogglePublish,
  onRetry,
}: CasesTableProps) {
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [caseToPublish, setCaseToPublish] = useState<AdminCase | null>(null);

  const handleToggle = async (item: AdminCase) => {
    // If it's currently a Draft and user wants to publish, open validation modal
    if (!item.isPublished) {
      setCaseToPublish(item);
      return;
    }

    // If it's already published and user wants to unpublish/draft, unpublish directly
    setPublishingId(item.id);
    await onTogglePublish(item.id, false);
    setPublishingId(null);
  };

  const handleConfirmPublishModal = async (id: string) => {
    return await onTogglePublish(id, true);
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-red-700 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table Container ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50/75 border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
            <tr>
              <th className="py-3.5 px-4 w-16 text-center">#</th>
              <th className="py-3.5 px-4 w-28">Cover</th>
              <th className="py-3.5 px-4 min-w-[220px]">Case Info</th>
              <th className="py-3.5 px-4 w-32">Price</th>
              <th className="py-3.5 px-4 w-36">Status</th>
              <th className="py-3.5 px-4 w-36">Created</th>
              <th className="py-3.5 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 size={28} className="animate-spin text-red-600" />
                    <span className="text-xs font-medium text-neutral-400">
                      Loading cases…
                    </span>
                  </div>
                </td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <FolderOpen size={24} />
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      No cases found
                    </span>
                    <span className="text-xs text-neutral-400 max-w-xs">
                      Try adjusting your search criteria or create a new case to get started.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              cases.map((item) => {
                const isItemPublishing = publishingId === item.id;
                const formattedDate = new Date(item.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                );

                const priceDisplay =
                  item.priceInRupees > 0 ? (
                    <span className="font-mono font-semibold text-neutral-900 flex items-center gap-0.5">
                      ₹{item.priceInRupees.toLocaleString()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      FREE
                    </span>
                  );

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50/50 transition-colors group"
                  >
                    {/* Case # */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-900 text-xs">
                      #{item.caseNumber}
                    </td>

                    {/* Cover Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="w-20 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden relative group/img flex items-center justify-center">
                        {item.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.coverImageUrl}
                            alt={item.title}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              const fallback = (e.target as HTMLImageElement).nextElementSibling;
                              if (fallback) fallback.classList.remove("hidden");
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center text-neutral-400 text-[10px] bg-neutral-100 ${
                            item.coverImageUrl ? "hidden" : ""
                          }`}
                        >
                          No Cover
                        </div>
                        {item.coverImageUrl && (
                          <a
                            href={item.coverImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
                            title="View full cover"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Case Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 text-sm line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-xs">{priceDisplay}</td>

                    {/* Published Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={isItemPublishing}
                        onClick={() => handleToggle(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                          item.isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                        } disabled:opacity-50`}
                      >
                        {isItemPublishing ? (
                          <Loader2 size={12} className="animate-spin text-neutral-500" />
                        ) : item.isPublished ? (
                          <CheckCircle2 size={12} className="text-emerald-600" />
                        ) : (
                          <CircleDashed size={12} className="text-neutral-400" />
                        )}
                        <span>{item.isPublished ? "Published" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-xs text-neutral-500 font-mono">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewCase ? onViewCase(item) : (window.location.href = `/admin/cases/${item.id}`)}
                          title="View Case Details"
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCase(item)}
                          title="Edit Case"
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCase(item)}
                          title="Delete Case"
                          className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ── */}
      <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <span className="text-xs text-neutral-500">
          Showing Page{" "}
          <span className="font-semibold text-neutral-900">{page}</span> of{" "}
          <span className="font-semibold text-neutral-900">{totalPages}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Publish Validation Confirmation Modal ── */}
      <PublishCaseModal
        isOpen={Boolean(caseToPublish)}
        caseItem={caseToPublish}
        onClose={() => setCaseToPublish(null)}
        onConfirmPublish={handleConfirmPublishModal}
      />
    </div>
  );
}
