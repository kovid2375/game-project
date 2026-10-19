"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { AdminCase } from "@/lib/api/cases.api";

interface DeleteCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: AdminCase | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteCaseDialog({
  isOpen,
  onClose,
  caseItem,
  onConfirm,
  isDeleting,
}: DeleteCaseDialogProps) {
  if (!isOpen || !caseItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-neutral-100 flex flex-col gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle size={24} />
        </div>

        <div>
          <h3 className="text-base font-bold text-neutral-900">
            Delete Case #{caseItem.caseNumber}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-neutral-900">
              &quot;{caseItem.title}&quot;
            </span>
            ? This action cannot be undone and will remove the case from the database.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            {isDeleting && <Loader2 size={15} className="animate-spin" />}
            <span>Delete Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
