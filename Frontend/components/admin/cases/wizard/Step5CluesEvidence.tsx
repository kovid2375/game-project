"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Tag,
  Key,
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Sparkles,
  MapPin,
  Users,
} from "lucide-react";
import {
  CaseLocation,
  CaseSuspect,
  LocationClue,
  CaseSolution,
  UpsertSolutionPayload,
  casesApi,
} from "@/lib/api/cases.api";

interface Step5CluesEvidenceProps {
  caseId: string;
  onBack: () => void;
  onNext: () => void;
}

export default function Step5CluesEvidence({
  caseId,
  onBack,
  onNext,
}: Step5CluesEvidenceProps) {
  // Data states
  const [suspects, setSuspects] = useState<CaseSuspect[]>([]);
  const [locations, setLocations] = useState<CaseLocation[]>([]);
  const [allClues, setAllClues] = useState<
    { clue: LocationClue; locationName: string }[]
  >([]);

  // Solution Form states
  const [correctSuspectId, setCorrectSuspectId] = useState("");
  const [motive, setMotive] = useState("");
  const [method, setMethod] = useState("");
  const [explanation, setExplanation] = useState("");
  const [epilogue, setEpilogue] = useState("");

  // Keyword tags states
  const [motiveKeywordInput, setMotiveKeywordInput] = useState("");
  const [motiveKeywords, setMotiveKeywords] = useState<string[]>([]);

  const [methodKeywordInput, setMethodKeywordInput] = useState("");
  const [methodKeywords, setMethodKeywords] = useState<string[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successSaved, setSuccessSaved] = useState(false);

  // Load all data
  useEffect(() => {
    if (!caseId || caseId === "draft") {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      casesApi.getSuspects(caseId).catch(() => ({ suspects: [] })),
      casesApi.getLocations(caseId).catch(() => []),
      casesApi.getSolution(caseId).catch(() => null),
    ])
      .then(async ([suspectsRes, locs, solution]) => {
        if (!isMounted) return;

        setSuspects(suspectsRes.suspects || []);
        setLocations(locs);

        // Fetch clues across all locations
        const cluesList: { clue: LocationClue; locationName: string }[] = [];
        for (const loc of locs) {
          try {
            const locClues = await casesApi.getClues(caseId, loc.id);
            for (const c of locClues) {
              cluesList.push({ clue: c, locationName: loc.name });
            }
          } catch {
            // ignore
          }
        }
        if (isMounted) setAllClues(cluesList);

        // Populate solution if previously saved
        if (solution && isMounted) {
          setCorrectSuspectId(solution.correctSuspectId || "");
          setMotive(solution.motive || "");
          setMethod(solution.method || "");
          setExplanation(solution.explanation || "");
          setEpilogue(solution.epilogue || "");
          setMotiveKeywords(solution.motiveKeywords || []);
          setMethodKeywords(solution.methodKeywords || []);
        } else if (suspectsRes.suspects?.length > 0 && !correctSuspectId) {
          setCorrectSuspectId(suspectsRes.suspects[0].id);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [caseId]);

  // Keyword helper methods
  const handleAddMotiveKeyword = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter" && e.key !== ",") return;
    if (e) e.preventDefault();

    const clean = motiveKeywordInput.trim().toLowerCase().replace(/[^\w\s]/g, "");
    if (clean && !motiveKeywords.includes(clean)) {
      setMotiveKeywords((prev) => [...prev, clean]);
    }
    setMotiveKeywordInput("");
  };

  const handleRemoveMotiveKeyword = (tag: string) => {
    setMotiveKeywords((prev) => prev.filter((k) => k !== tag));
  };

  const handleAddMethodKeyword = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter" && e.key !== ",") return;
    if (e) e.preventDefault();

    const clean = methodKeywordInput.trim().toLowerCase().replace(/[^\w\s]/g, "");
    if (clean && !methodKeywords.includes(clean)) {
      setMethodKeywords((prev) => [...prev, clean]);
    }
    setMethodKeywordInput("");
  };

  const handleRemoveMethodKeyword = (tag: string) => {
    setMethodKeywords((prev) => prev.filter((k) => k !== tag));
  };

  // Submit Solution
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessSaved(false);

    if (!correctSuspectId) {
      setFormError("Please select the culprit / true killer.");
      return;
    }
    if (!motive.trim()) {
      setFormError("Please describe the true motive.");
      return;
    }
    if (!method.trim()) {
      setFormError("Please describe the murder method / weapon.");
      return;
    }
    if (!explanation.trim()) {
      setFormError("Detailed deduction explanation is required.");
      return;
    }
    if (!epilogue.trim()) {
      setFormError("Case epilogue / wrap-up story is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpsertSolutionPayload = {
        correctSuspectId,
        motive: motive.trim(),
        method: method.trim(),
        explanation: explanation.trim(),
        epilogue: epilogue.trim(),
        motiveKeywords,
        methodKeywords,
      };

      await casesApi.upsertSolution(caseId, payload);
      setSuccessSaved(true);
      onNext();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save case solution."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 size={28} className="animate-spin text-red-600" />
        <p className="text-xs text-neutral-500 font-medium">
          Loading evidence repository and solution matrix...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Top Evidence Matrix Summary (Clues Found Across Locations) ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border border-red-100">
              <Tag size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Evidence Repository ({allClues.length} Items)
              </h2>
              <p className="text-[11px] text-neutral-500">
                Clues discovered by investigators across case locations
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-neutral-400">
            Locations: {locations.length}
          </span>
        </div>

        {allClues.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700">No clues attached yet</p>
            <p className="text-[11px] text-neutral-400">
              Go back to Step 3 (Locations) if you wish to attach specific weapon, document, or trace evidence.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {allClues.map(({ clue, locationName }) => (
              <div
                key={clue.id}
                className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-start gap-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  <Tag size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-900 truncate">
                    {clue.title}
                  </p>
                  <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="shrink-0 text-neutral-400" />
                    <span className="truncate">{locationName}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Case Solution & Culprit Determination ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              The True Solution (Culprit & Accusation Key)
            </h2>
            <p className="text-[11px] text-neutral-500">
              Backend grading engine compares player accusations against this solution key
            </p>
          </div>
        </div>

        {/* Culprit Suspect Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-neutral-800">
            Select the True Culprit / Killer <span className="text-red-500">*</span>
          </label>

          {suspects.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              ⚠️ No suspects found in this case. Please go back to Step 4 (Suspects) and add at least one suspect.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suspects.map((s) => {
                const isSelected = correctSuspectId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setCorrectSuspectId(s.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-red-50/50 border-red-500 ring-2 ring-red-500/15 shadow-xs"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-neutral-900 shrink-0 overflow-hidden border border-neutral-200 relative">
                      {s.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.photoUrl}
                          alt={s.name}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-tr from-neutral-800 to-neutral-700">
                          {s.name.charAt(0) || "S"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {s.relationship}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Motive & Method Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Motive canonical + Keywords */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-800">
                  True Motive (Canonical Answer) <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-neutral-400">
                  {motive.length}/2000
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={2000}
                placeholder="e.g. Financial embezzlement discovery: victim threatened to expose the forged ledger..."
                value={motive}
                onChange={(e) => setMotive(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none"
              />
            </div>

            {/* Motive Keywords Tagging */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                Accepted Motive Keywords (for player accusation matching)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type keyword and press Enter (e.g. money, debt, blackmail)"
                  value={motiveKeywordInput}
                  onChange={(e) => setMotiveKeywordInput(e.target.value)}
                  onKeyDown={handleAddMotiveKeyword}
                  className="flex-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddMotiveKeyword}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Motive Tags pill container */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {motiveKeywords.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMotiveKeyword(tag)}
                      className="hover:text-red-900 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Method canonical + Keywords */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-800">
                  True Method / Weapon (Canonical Answer) <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-neutral-400">
                  {method.length}/2000
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={2000}
                placeholder="e.g. Poisoned digitalis slipped into the decanter, followed by staged blunt impact..."
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none"
              />
            </div>

            {/* Method Keywords Tagging */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                Accepted Method Keywords (for player accusation matching)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type keyword and press Enter (e.g. poison, knife, wine)"
                  value={methodKeywordInput}
                  onChange={(e) => setMethodKeywordInput(e.target.value)}
                  onKeyDown={handleAddMethodKeyword}
                  className="flex-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddMethodKeyword}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Method Tags pill container */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {methodKeywords.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMethodKeyword(tag)}
                      className="hover:text-emerald-900 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deduction Explanation */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-800">
              Official Deduction & Crime Breakdown <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-neutral-400">
              {explanation.length}/5000
            </span>
          </div>
          <textarea
            rows={4}
            required
            maxLength={5000}
            placeholder="Step-by-step reconstruction of how the crime transpired, how each piece of evidence links together, and why alternative suspects are cleared..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none"
          />
        </div>

        {/* Epilogue Story */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-800">
              Case Epilogue & Aftermath Story <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-neutral-400">
              {epilogue.length}/5000
            </span>
          </div>
          <textarea
            rows={4}
            required
            maxLength={5000}
            placeholder="The narrative text shown to the player upon successful conviction: police arrest scenes, confessions, trial outcome, and final detective reflections..."
            value={epilogue}
            onChange={(e) => setEpilogue(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none"
          />
        </div>
      </div>

      {/* ── Navigation Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Suspects</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Solution Key...</span>
            </>
          ) : (
            <>
              <span>Next: Final Review</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
