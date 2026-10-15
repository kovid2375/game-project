"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  User,
  ShieldAlert,
  Save,
  Check,
} from "lucide-react";
import { AdminUser, AdminPagination } from "@/lib/api/admin.api";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface UsersTableProps {
  users: AdminUser[];
  pagination: AdminPagination | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  onPageChange: (page: number) => void;
  onUpdateUser: (
    id: string,
    data: { name?: string; email?: string; isActive?: boolean },
  ) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  onRetry: () => void;
}

function initials(name: string) {
  if (!name) return "P";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function UsersTable({
  users,
  pagination,
  isLoading,
  error,
  page,
  onPageChange,
  onUpdateUser,
  onDeleteUser,
  onRetry,
}: UsersTableProps) {
  // ── Drawer State ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [drawerName, setDrawerName] = useState("");
  const [drawerEmail, setDrawerEmail] = useState("");
  const [drawerActive, setDrawerActive] = useState(true);
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);

  // ── Confirm Delete Dialog State ──
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Toast Notifications State ──
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Open Drawer ──
  const openEditDrawer = (user: AdminUser) => {
    setEditingUser(user);
    setDrawerName(user.name);
    setDrawerEmail(user.email);
    setDrawerActive(user.isActive);
    setDrawerOpen(true);
  };

  const closeEditDrawer = () => {
    if (isSavingDrawer) return;
    setDrawerOpen(false);
    setEditingUser(null);
  };

  // ── Save Drawer Changes ──
  const handleDrawerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!drawerName.trim() || !drawerEmail.trim()) {
      addToast("error", "Name and email are required");
      return;
    }

    setIsSavingDrawer(true);
    const success = await onUpdateUser(editingUser.id, {
      name: drawerName.trim(),
      email: drawerEmail.trim().toLowerCase(),
      isActive: drawerActive,
    });
    setIsSavingDrawer(false);

    if (success) {
      addToast("success", `Player "${drawerName.trim()}" updated successfully`);
      closeEditDrawer();
    } else {
      addToast("error", "Failed to update player details");
    }
  };

  // ── Open Delete Confirm Dialog ──
  const openDeleteDialog = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // ── Execute Delete ──
  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    const success = await onDeleteUser(userToDelete.id);
    setIsDeleting(false);

    if (success) {
      addToast("success", `Player "${userToDelete.name}" deleted successfully`);
      closeDeleteDialog();
    } else {
      addToast("error", "Failed to delete player account");
    }
  };

  // ── Quick Toggle Active Status ──
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = !user.isActive;
    const success = await onUpdateUser(user.id, {
      isActive: nextStatus,
    });
    if (success) {
      addToast(
        "success",
        `Player "${user.name}" status marked as ${nextStatus ? "Active" : "Inactive"}`
      );
    } else {
      addToast("error", "Failed to update player status");
    }
  };

  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || users.length;
  const limit = pagination?.limit || 10;

  return (
    <>
      {/* ── Main Table Card ── */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75">
                {["Player", "Status", "Role", "Registered", "Email Status", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h || `actions-${i}`}
                      className={`text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-6 py-3.5 ${
                        i === 5 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={26} className="animate-spin text-red-600" />
                      <p className="text-xs text-neutral-500 uppercase tracking-wider font-mono">
                        Loading player records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle size={26} className="text-red-600" />
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                      <button
                        onClick={onRetry}
                        className="px-4 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-neutral-500 text-sm">
                      No players found matching your criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-neutral-50/80 transition-colors group"
                  >
                    {/* User */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-xs font-bold text-red-600 shrink-0 shadow-2xs">
                          {initials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-neutral-500 truncate font-mono">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title="Click to toggle player active status"
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? "bg-emerald-500" : "bg-neutral-400"
                          }`}
                        />
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {u.role}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="px-6 py-3.5 text-xs text-neutral-600 whitespace-nowrap font-medium">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Email Verified */}
                    <td className="px-6 py-3.5 text-xs whitespace-nowrap">
                      {u.emailVerifiedAt ? (
                        <span className="text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-medium bg-neutral-50 px-2 py-0.5 rounded">
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditDrawer(u)}
                          title="Edit player details"
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit2 size={13} className="text-neutral-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteDialog(u)}
                          title="Delete player"
                          className="p-1.5 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 bg-neutral-50/50">
            <span className="text-xs text-neutral-500">
              Showing{" "}
              <span className="text-neutral-900 font-semibold">
                {(page - 1) * limit + 1}
              </span>{" "}
              –{" "}
              <span className="text-neutral-900 font-semibold">
                {Math.min(page * limit, total)}
              </span>{" "}
              of{" "}
              <span className="text-neutral-900 font-semibold">{total}</span> players
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md hover:bg-white border border-transparent hover:border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => onPageChange(n)}
                  className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    n === page
                      ? "bg-red-600 text-white shadow-2xs"
                      : "text-neutral-600 hover:bg-white hover:border hover:border-neutral-200"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md hover:bg-white border border-transparent hover:border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right-Side Slide-Over Drawer for Editing ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={closeEditDrawer}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div>
                <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-2xs">
                      <Edit2 size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-neutral-900 leading-tight">
                        Edit Player Account
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Update personal details and active access
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeEditDrawer}
                    disabled={isSavingDrawer}
                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form Fields */}
                <form id="edit-drawer-form" onSubmit={handleDrawerSave} className="p-6 space-y-5">
                  {/* Player ID badge */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Internal ID
                    </p>
                    <p className="text-xs font-mono text-neutral-700 truncate mt-0.5">
                      {editingUser?.id}
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      />
                      <input
                        type="text"
                        required
                        value={drawerName}
                        onChange={(e) => setDrawerName(e.target.value)}
                        placeholder="Player Name"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      />
                      <input
                        type="email"
                        required
                        value={drawerEmail}
                        onChange={(e) => setDrawerEmail(e.target.value)}
                        placeholder="player@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Active Status Toggle */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Account Status
                    </label>
                    <div
                      onClick={() => setDrawerActive(!drawerActive)}
                      className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/60 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {drawerActive ? "Active Player" : "Suspended / Inactive"}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {drawerActive
                            ? "Player is permitted to authenticate and play cases"
                            : "Account is temporarily deactivated from the game"}
                        </p>
                      </div>

                      <div
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                          drawerActive ? "bg-red-600" : "bg-neutral-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            drawerActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeEditDrawer}
                  disabled={isSavingDrawer}
                  className="flex-1 py-2.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-sm font-semibold text-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  form="edit-drawer-form"
                  type="submit"
                  disabled={isSavingDrawer}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-bold text-white shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingDrawer ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal Dialog ── */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={closeDeleteDialog}
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Dialog Box */}
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert size={24} />
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Delete Player Account?
                </h3>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-neutral-800">
                    &quot;{userToDelete.name}&quot;
                  </span>{" "}
                  ({userToDelete.email})? All associated game progress and active sessions will be permanently purged.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification Container ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-300 ${
              toast.type === "success"
                ? "bg-white border-emerald-200 text-neutral-900 shadow-emerald-500/10"
                : toast.type === "error"
                  ? "bg-white border-red-200 text-neutral-900 shadow-red-500/10"
                  : "bg-white border-neutral-200 text-neutral-900 shadow-neutral-500/10"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            )}
            {toast.type === "error" && (
              <XCircle size={18} className="text-red-600 shrink-0" />
            )}
            {toast.type === "info" && (
              <AlertCircle size={18} className="text-blue-600 shrink-0" />
            )}

            <p className="text-xs font-semibold text-neutral-800 flex-1 leading-snug">
              {toast.message}
            </p>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
