"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Upload,
  Trash2,
  Lock,
  Eye,
  MessageSquare,
  Plus,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  CaseSuspect,
  InterviewThread,
  UpdateSuspectPayload,
  CreateInterviewThreadPayload,
  CreateInterviewResponsePayload,
} from "@/lib/api/cases.api";

interface SuspectEditorPanelProps {
  suspect: CaseSuspect;
  threads: InterviewThread[];
  isLoadingThreads: boolean;
  onClose: () => void;
  onUpdateSuspect: (payload: UpdateSuspectPayload) => Promise<boolean>;
  onDeleteSuspect: () => Promise<boolean>;
  onCreateThread: (
    payload: CreateInterviewThreadPayload,
    initialResponse?: CreateInterviewResponsePayload
  ) => Promise<boolean>;
  onDeleteThread: (threadId: string) => Promise<boolean>;
  onUploadPhoto: (file: File) => Promise<{ url?: string; error?: string }>;
}

export default function SuspectEditorPanel({
  suspect,
  threads,
  isLoadingThreads,
  onClose,
  onUpdateSuspect,
  onDeleteSuspect,
  onCreateThread,
  onDeleteThread,
  onUploadPhoto,
}: SuspectEditorPanelProps) {
  const [name, setName] = useState(suspect.name);
  const [relationship, setRelationship] = useState(suspect.relationship);
  const [description, setDescription] = useState(suspect.description);
  const [claimedAlibi, setClaimedAlibi] = useState(suspect.claimedAlibi);
  const [connections, setConnections] = useState(suspect.connections || "");
  const [photoUrl, setPhotoUrl] = useState(suspect.photoUrl || "");
  const [isInitiallyUnlocked, setIsInitiallyUnlocked] = useState(
    suspect.isInitiallyUnlocked
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Interview Question modal
  const [isAddingThread, setIsAddingThread] = useState(false);
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isNervous, setIsNervous] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [isThreadSubmitting, setIsThreadSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(suspect.name);
    setRelationship(suspect.relationship);
    setDescription(suspect.description);
    setClaimedAlibi(suspect.claimedAlibi);
    setConnections(suspect.connections || "");
    setPhotoUrl(suspect.photoUrl || "");
    setIsInitiallyUnlocked(suspect.isInitiallyUnlocked);
  }, [suspect.id]);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const res = await onUploadPhoto(file);
    setIsUploading(false);
    if (res.url) {
      setPhotoUrl(res.url);
      await onUpdateSuspect({ photoUrl: res.url });
    }
  };

  const handleBlurSave = async () => {
    setIsSaving(true);
    await onUpdateSuspect({
      name: name.trim(),
      relationship: relationship.trim(),
      description: description.trim(),
      claimedAlibi: claimedAlibi.trim(),
      connections: connections.trim(),
      photoUrl: photoUrl.trim() || undefined,
      isInitiallyUnlocked,
    });
    setIsSaving(false);
  };

  const handleCreateThreadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !question.trim()) return;

    setIsThreadSubmitting(true);
    const ok = await onCreateThread(
      {
        topic: topic.trim(),
        question: question.trim(),
        isInitiallyAvailable: true,
        visitNumber: 1,
      },
      answer.trim()
        ? {
            responseText: answer.trim(),
            isNervous,
            internalNotes: internalNotes.trim() || undefined,
          }
        : undefined
    );
    setIsThreadSubmitting(false);

    if (ok) {
      setTopic("");
      setQuestion("");
      setAnswer("");
      setIsNervous(false);
      setInternalNotes("");
      setIsAddingThread(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Suspect Dossier</h3>
          <p className="text-[11px] text-neutral-400">
            Profile, alibi statement, and interrogation lines
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
        {/* Photo avatar header banner */}
        <div className="flex items-center gap-4 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70">
          <div className="relative w-16 h-16 rounded-2xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-300 shadow-2xs group">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={name}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-xl bg-gradient-to-tr from-neutral-800 to-neutral-700">
                {name.charAt(0) || "S"}
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 z-20">
                <Loader2 size={20} className="animate-spin text-red-500" />
                <span className="text-[10px] font-semibold text-white">Uploading…</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handlePhotoUpload(e.target.files[0]);
                }
              }}
            />

            {!isUploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
              >
                <Upload size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-neutral-900 truncate">
              {name || "Unnamed Suspect"}
            </h4>
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {relationship || "No relationship defined"}
            </p>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 mt-1 cursor-pointer block disabled:opacity-50"
            >
              {isUploading ? "Uploading photo…" : photoUrl ? "Change Photo" : "Upload Photo"}
            </button>
          </div>
        </div>

        {/* Name & Relationship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleBlurSave}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 font-semibold focus:border-red-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Relationship / Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Business Partner, Spouse"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              onBlur={handleBlurSave}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        {/* Status / Availability */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-800">
            Availability in Case
          </label>
          <select
            value={isInitiallyUnlocked ? "unlocked" : "locked"}
            onChange={(e) => {
              const val = e.target.value === "unlocked";
              setIsInitiallyUnlocked(val);
              onUpdateSuspect({ isInitiallyUnlocked: val });
            }}
            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="unlocked">🟢 Unlocked (Available for questioning from start)</option>
            <option value="locked">🔒 Locked (Unlocked via clues or leads)</option>
          </select>
        </div>

        {/* Claimed Alibi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-800">
              Claimed Alibi <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-neutral-400">
              {claimedAlibi.length}/1000
            </span>
          </div>
          <textarea
            rows={2}
            value={claimedAlibi}
            placeholder="Claims to have been at home between 9 PM and 11 PM..."
            onChange={(e) => setClaimedAlibi(e.target.value)}
            onBlur={handleBlurSave}
            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:border-red-500 outline-none resize-none"
          />
        </div>

        {/* Description & Bio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-800">
              Background & Demeanor
            </label>
            <span className="text-[10px] text-neutral-400">
              {description.length}/2000
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            placeholder="Personality, body language, visible nervousness, occupation..."
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlurSave}
            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:border-red-500 outline-none resize-none"
          />
        </div>

        {/* Connections */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-800">
            Dossier Connections & Motive Clues
          </label>
          <input
            type="text"
            placeholder="e.g. Owed $50,000 in debts; seen near building at 8:45 PM"
            value={connections}
            onChange={(e) => setConnections(e.target.value)}
            onBlur={handleBlurSave}
            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:border-red-500 outline-none"
          />
        </div>

        {/* Interrogation Questions & Threads */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-red-600" />
              <span className="text-xs font-bold text-neutral-900">
                Interrogation Questions ({threads.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingThread(!isAddingThread)}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>{isAddingThread ? "Cancel" : "Add Question"}</span>
            </button>
          </div>

          {/* Add question form */}
          {isAddingThread && (
            <form
              onSubmit={handleCreateThreadSubmit}
              className="p-3.5 bg-red-50/40 rounded-xl border border-red-200/80 space-y-2.5 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                  Topic / Line of Inquiry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alibi, Relationship, Murder Weapon"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                  Detective Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Where were you between 9 PM and 11 PM?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                  Suspect Response / Answer
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. I told you, I was home reading. Ask my doorman if you don't believe me."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="nervousChk"
                  checked={isNervous}
                  onChange={(e) => setIsNervous(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500"
                />
                <label
                  htmlFor="nervousChk"
                  className="text-[11px] text-neutral-700 cursor-pointer font-medium"
                >
                  Suspect exhibits visible nervousness
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isThreadSubmitting}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs shadow cursor-pointer disabled:opacity-50"
                >
                  {isThreadSubmitting ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          )}

          {/* Threads list */}
          <div className="space-y-2">
            {isLoadingThreads ? (
              <div className="py-3 text-center text-xs text-neutral-400">
                <Loader2 size={15} className="animate-spin mx-auto text-red-600 mb-1" />
                <span>Loading interrogation threads...</span>
              </div>
            ) : threads.length === 0 ? (
              <p className="text-[11px] text-neutral-400 py-1 italic">
                No interview questions configured for this suspect yet.
              </p>
            ) : (
              threads.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-1.5 text-xs hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {t.topic}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteThread(t.id)}
                      className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="font-semibold text-neutral-900 leading-snug">
                    &ldquo;{t.question}&rdquo;
                  </p>
                  {t.responses && t.responses.length > 0 && (
                    <div className="p-2 rounded-lg bg-white border border-neutral-100 text-[11px] text-neutral-600 italic">
                      {t.responses[0].responseText}
                      {t.responses[0].isNervous && (
                        <span className="ml-2 not-italic text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                          Nervous
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete Suspect button */}
        <div className="pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onDeleteSuspect}
            className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete Suspect from Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
