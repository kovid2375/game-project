"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi, AdminUserDetail } from "@/lib/api/admin.api";
import UserHeader from "@/components/admin/users/UserHeader";
import UserOverviewTab from "@/components/admin/users/UserOverviewTab";
import UserGameProgressTab from "@/components/admin/users/UserGameProgressTab";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  X,
  Edit2,
  Trash2,
} from "lucide-react";

type UserDetailTab =
  | "overview"
  | "game_progress"
  | "purchase_history"
  | "activity_log";

const TABS: { id: UserDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "game_progress", label: "Game Progress" },
  { id: "purchase_history", label: "Purchase History" },
  { id: "activity_log", label: "Activity Log" },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [activeTab, setActiveTab] = useState<UserDetailTab>("overview");
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUser = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getUser(userId);
      setUser(data);
      setEditName(data.name);
      setEditEmail(data.email);
      setEditActive(data.isActive);
    } catch (err: any) {
      console.error("Failed to load user:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load user details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setIsSaving(true);
      const res = await adminApi.updateUser(user.id, {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        isActive: editActive,
      });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: res.name,
              email: res.email,
              isActive: res.isActive,
            }
          : prev
      );
      setIsDrawerOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteUser(user.id);
      setIsDeleteModalOpen(false);
      router.push("/admin/users");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete user.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-red-600" />
        <p className="text-sm font-medium text-neutral-500">Loading player details…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center mt-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">User not found</h2>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          {error || "Could not retrieve the player account details."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Players
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <UserHeader
        user={user}
        onEdit={() => setIsDrawerOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {/* ── Tabs Navigation ── */}
      <div className="border-b border-neutral-200 mt-6">
        <nav className="flex space-x-8 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-3 px-1 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "text-red-600"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      <div className="animate-in fade-in duration-150">
        {activeTab === "overview" && <UserOverviewTab user={user} />}
        {activeTab === "game_progress" && (
          <UserGameProgressTab playerCases={user.playerCases} />
        )}
        {activeTab === "purchase_history" && (
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-12 text-center mt-6">
            <p className="text-xs text-neutral-400">
              No transactions or purchase history found for this account.
            </p>
          </div>
        )}
        {activeTab === "activity_log" && (
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 mt-6">
            <h4 className="text-sm font-bold text-neutral-800 mb-3">
              Recent Login Sessions
            </h4>
            {user.sessions && user.sessions.length > 0 ? (
              <div className="divide-y divide-neutral-100 text-xs">
                {user.sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <span className="font-mono text-neutral-500">
                      Session #{sess.id.slice(0, 8)}
                    </span>
                    <span className="text-neutral-700">
                      Created: {new Date(sess.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No active sessions logged.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Drawer ── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => !isSaving && setIsDrawerOpen(false)}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col justify-between">
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <Edit2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Edit Player Details
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Update account information
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs outline-none focus:border-red-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-medium text-neutral-700">
                      Active Account Status
                    </span>
                  </label>
                </div>
              </form>

              <div className="p-6 border-t border-neutral-100 flex items-center justify-end gap-2 bg-neutral-50/50">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Delete Player Account?
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to permanently delete{" "}
                <strong>{user.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Player"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

