"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Lock,
  Eye,
  Trash2,
  MessageSquare,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import {
  CaseSuspect,
  InterviewThread,
  CreateSuspectPayload,
  UpdateSuspectPayload,
  CreateInterviewThreadPayload,
  CreateInterviewResponsePayload,
  casesApi,
} from "@/lib/api/cases.api";
import SuspectEditorPanel from "./SuspectEditorPanel";

interface Step4SuspectsProps {
  caseId: string;
  onBack: () => void;
  onNext: () => void;
}

export default function Step4Suspects({
  caseId,
  onBack,
  onNext,
}: Step4SuspectsProps) {
  const [suspects, setSuspects] = useState<CaseSuspect[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<CaseSuspect | null>(
    null
  );
  const [threads, setThreads] = useState<InterviewThread[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add suspect modal state
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [newAlibi, setNewAlibi] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsUnlocked, setNewIsUnlocked] = useState(true);
  const [isCreatingSubmitting, setIsCreatingSubmitting] = useState(false);

  // Fetch all suspects
  const fetchSuspects = async () => {
    try {
      setIsLoading(true);
      const res = await casesApi.getSuspects(caseId);
      setSuspects(res.suspects || []);
      if (res.suspects && res.suspects.length > 0 && !selectedSuspect) {
        setSelectedSuspect(res.suspects[0]);
      }
    } catch (err) {
      console.error("Failed to load suspects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (caseId && caseId !== "draft") {
      fetchSuspects();
    } else {
      setIsLoading(false);
    }
  }, [caseId]);

  // Fetch interrogation threads when selected suspect changes
  useEffect(() => {
    if (!selectedSuspect?.id) {
      setThreads([]);
      return;
    }

    let isMounted = true;
    setIsLoadingThreads(true);

    casesApi
      .getInterviewThreads(selectedSuspect.id)
      .then((res) => {
        if (isMounted) setThreads(res.threads || []);
      })
      .catch((err) => {
        console.error("Failed to load threads:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingThreads(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSuspect?.id]);

  // Create suspect
  const handleCreateSuspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRelationship.trim() || !newAlibi.trim()) return;

    setIsCreatingSubmitting(true);
    try {
      const res = await casesApi.createSuspect(caseId, {
        name: newName.trim(),
        relationship: newRelationship.trim(),
        claimedAlibi: newAlibi.trim(),
        description: newDescription.trim() || "No additional description.",
        isInitiallyUnlocked: newIsUnlocked,
      });

      setSuspects((prev) => [...prev, res.suspect]);
      setSelectedSuspect(res.suspect);
      setIsCreatingModal(false);
      setNewName("");
      setNewRelationship("");
      setNewAlibi("");
      setNewDescription("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create suspect");
    } finally {
      setIsCreatingSubmitting(false);
    }
  };

  // Update suspect
  const handleUpdateSuspect = async (payload: UpdateSuspectPayload) => {
    if (!selectedSuspect) return false;
    try {
      const res = await casesApi.updateSuspect(selectedSuspect.id, payload);
      setSelectedSuspect(res.suspect);
      setSuspects((prev) =>
        prev.map((s) => (s.id === res.suspect.id ? res.suspect : s))
      );
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update suspect");
      return false;
    }
  };

  // Delete suspect
  const handleDeleteSuspect = async () => {
    if (!selectedSuspect) return false;
    if (
      !confirm(
        `Are you sure you want to remove suspect "${selectedSuspect.name}" from this case?`
      )
    ) {
      return false;
    }

    try {
      await casesApi.deleteSuspect(selectedSuspect.id);
      const remaining = suspects.filter((s) => s.id !== selectedSuspect.id);
      setSuspects(remaining);
      setSelectedSuspect(remaining[0] || null);
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete suspect");
      return false;
    }
  };

  // Create interview question + initial response
  const handleCreateThread = async (
    payload: CreateInterviewThreadPayload,
    initialResponse?: CreateInterviewResponsePayload
  ) => {
    if (!selectedSuspect) return false;
    try {
      const threadRes = await casesApi.createInterviewThread(
        selectedSuspect.id,
        payload
      );
      const thread = (threadRes as any).thread || threadRes;

      if (initialResponse && thread?.id) {
        const resp = await casesApi.createInterviewResponse(
          thread.id,
          initialResponse
        );
        thread.responses = [resp];
      }

      setThreads((prev) => [...prev, thread]);
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create interview question");
      return false;
    }
  };

  // Delete interview thread
  const handleDeleteThread = async (threadId: string) => {
    try {
      await casesApi.deleteInterviewThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete thread");
      return false;
    }
  };

  // Upload photo
  const handleUploadPhoto = async (file: File) => {
    try {
      const res = await casesApi.uploadCover(file);
      return { url: res.url };
    } catch (err: any) {
      return {
        error: err.response?.data?.message || "Photo upload failed",
      };
    }
  };

  const filteredSuspects = suspects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSuspects = suspects.length;
  const initialAvailable = suspects.filter((s) => s.isInitiallyUnlocked).length;
  const lockedSuspects = suspects.filter((s) => !s.isInitiallyUnlocked).length;

  return (
    <div className="space-y-6">
      {/* ── Top Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {totalSuspects}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Total Suspects
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {initialAvailable}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Questionable at Start
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Lock size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {lockedSuspects}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Locked / Unlockable
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {threads.length}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Active Question Lines
            </span>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Split: Suspects Grid & Dossier Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Suspects Gallery (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Suspects Lineup ({suspects.length})
              </h3>
              <p className="text-[11px] text-neutral-500">
                Select a suspect to review statements and interrogations
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Suspect</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            <Search size={14} className="text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Search suspects by name or relationship..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-neutral-800 placeholder-neutral-400 text-xs"
            />
          </div>

          {/* Suspects Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
            {isLoading ? (
              <div className="col-span-2 py-12 text-center text-xs text-neutral-400">
                <Loader2 size={20} className="animate-spin mx-auto text-red-600 mb-2" />
                <span>Loading suspect lineup...</span>
              </div>
            ) : filteredSuspects.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-neutral-400">
                <span>No suspects found. Click &quot;+ Add Suspect&quot; to add persons of interest.</span>
              </div>
            ) : (
              filteredSuspects.map((s) => {
                const isSelected = selectedSuspect?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSuspect(s)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? "bg-red-50/40 border-red-300 ring-2 ring-red-500/15 shadow-xs"
                        : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-200 relative">
                        {s.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.photoUrl}
                            alt={s.name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-base bg-gradient-to-tr from-neutral-800 to-neutral-700">
                            {s.name.charAt(0) || "S"}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {s.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {s.relationship}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              s.isInitiallyUnlocked
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                s.isInitiallyUnlocked
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span>
                              {s.isInitiallyUnlocked ? "Unlocked" : "Locked"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alibi snippet */}
                    {s.claimedAlibi && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100">
                        <p className="text-[11px] text-neutral-500 line-clamp-2 italic">
                          &ldquo;{s.claimedAlibi}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Dossier Panel (5 cols) */}
        <div className="lg:col-span-5 h-full">
          {selectedSuspect ? (
            <SuspectEditorPanel
              suspect={selectedSuspect}
              threads={threads}
              isLoadingThreads={isLoadingThreads}
              onClose={() => setSelectedSuspect(null)}
              onUpdateSuspect={handleUpdateSuspect}
              onDeleteSuspect={handleDeleteSuspect}
              onCreateThread={handleCreateThread}
              onDeleteThread={handleDeleteThread}
              onUploadPhoto={handleUploadPhoto}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center text-neutral-400 space-y-2">
              <Users size={32} className="mx-auto text-neutral-300" />
              <p className="text-xs">
                Select a suspect from the lineup to inspect their alibi statement and interrogation lines.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Suspect Modal ── */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Add Person of Interest
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSuspect} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daniel Carter"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">
                  Relationship to Victim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Business partner, Estranged sibling"
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">
                  Claimed Alibi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Where they claim they were when the murder occurred..."
                  value={newAlibi}
                  onChange={(e) => setNewAlibi(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">
                  Background / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Financial disputes, suspicious behavior, motive context..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unlockedChk"
                  checked={newIsUnlocked}
                  onChange={(e) => setNewIsUnlocked(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-300 cursor-pointer"
                />
                <label
                  htmlFor="unlockedChk"
                  className="font-medium text-neutral-700 cursor-pointer"
                >
                  Available for interrogation from the start of the case
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSubmitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 shadow"
                >
                  {isCreatingSubmitting && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  <span>Add Suspect</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Navigation Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Locations</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer"
        >
          <span>Next: Clues & Evidence</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
