"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  CaseVictim,
  PoliceReport,
  UpsertVictimPayload,
  UpsertPoliceReportPayload,
} from "@/lib/api/cases.api";

interface Step2StoryDetailsProps {
  initialVictim?: CaseVictim | null;
  initialPoliceReport?: PoliceReport | null;
  isLoading?: boolean;
  onBack: () => void;
  onSubmit: (data: {
    victim: UpsertVictimPayload;
    policeReport: UpsertPoliceReportPayload;
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function Step2StoryDetails({
  initialVictim,
  initialPoliceReport,
  isLoading = false,
  onBack,
  onSubmit,
}: Step2StoryDetailsProps) {
  // Victim State
  const [victimName, setVictimName] = useState(initialVictim?.name ?? "");
  const [victimAge, setVictimAge] = useState<number | "">(
    initialVictim?.age ?? ""
  );
  const [victimOccupation, setVictimOccupation] = useState(
    initialVictim?.occupation ?? ""
  );
  const [dateOfDeath, setDateOfDeath] = useState(
    initialVictim?.dateOfDeath ? initialVictim.dateOfDeath.split("T")[0] : ""
  );
  const [placeOfDeath, setPlaceOfDeath] = useState(
    initialVictim?.placeOfDeath ?? ""
  );
  const [biography, setBiography] = useState(
    initialVictim?.biography ?? ""
  );

  // Police Report State
  const [causeOfDeath, setCauseOfDeath] = useState(
    initialPoliceReport?.causeOfDeath ?? ""
  );
  const [officerNotes, setOfficerNotes] = useState(
    initialPoliceReport?.officerNotes ?? ""
  );
  const [timeOfDeathStart, setTimeOfDeathStart] = useState(
    initialPoliceReport?.timeOfDeathStart
      ? initialPoliceReport.timeOfDeathStart.slice(0, 16)
      : ""
  );
  const [timeOfDeathEnd, setTimeOfDeathEnd] = useState(
    initialPoliceReport?.timeOfDeathEnd
      ? initialPoliceReport.timeOfDeathEnd.slice(0, 16)
      : ""
  );
  const [isReportPublished, setIsReportPublished] = useState(
    initialPoliceReport?.isPublished ?? true
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialVictim) {
      setVictimName(initialVictim.name || "");
      setVictimAge(initialVictim.age ?? "");
      setVictimOccupation(initialVictim.occupation || "");
      setDateOfDeath(
        initialVictim.dateOfDeath ? initialVictim.dateOfDeath.split("T")[0] : ""
      );
      setPlaceOfDeath(initialVictim.placeOfDeath || "");
      setBiography(initialVictim.biography || "");
    }
    if (initialPoliceReport) {
      setCauseOfDeath(initialPoliceReport.causeOfDeath || "");
      setOfficerNotes(initialPoliceReport.officerNotes || "");
      setTimeOfDeathStart(
        initialPoliceReport.timeOfDeathStart
          ? initialPoliceReport.timeOfDeathStart.slice(0, 16)
          : ""
      );
      setTimeOfDeathEnd(
        initialPoliceReport.timeOfDeathEnd
          ? initialPoliceReport.timeOfDeathEnd.slice(0, 16)
          : ""
      );
      setIsReportPublished(initialPoliceReport.isPublished ?? true);
    }
  }, [initialVictim, initialPoliceReport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate Victim fields
    if (!victimName.trim() || victimName.length > 120) {
      setFormError("Victim name is required (max 120 characters).");
      return;
    }
    if (victimAge === "" || Number(victimAge) < 0 || Number(victimAge) > 150) {
      setFormError("Victim age must be between 0 and 150.");
      return;
    }
    if (!victimOccupation.trim() || victimOccupation.length > 120) {
      setFormError("Victim occupation is required (max 120 characters).");
      return;
    }
    if (!dateOfDeath) {
      setFormError("Date of death is required.");
      return;
    }
    if (!placeOfDeath.trim() || placeOfDeath.length > 250) {
      setFormError("Place of death is required (max 250 characters).");
      return;
    }

    // Validate Police Report fields
    if (!causeOfDeath.trim() || causeOfDeath.length > 1000) {
      setFormError("Cause of death is required (max 1000 characters).");
      return;
    }
    if (!officerNotes.trim() || officerNotes.length > 5000) {
      setFormError("Officer notes are required (max 5000 characters).");
      return;
    }

    if (timeOfDeathStart && timeOfDeathEnd) {
      if (new Date(timeOfDeathStart) > new Date(timeOfDeathEnd)) {
        setFormError(
          "Time of death start cannot be later than time of death end."
        );
        return;
      }
    }

    setIsSubmitting(true);

    const victimPayload: UpsertVictimPayload = {
      name: victimName.trim(),
      age: Number(victimAge),
      occupation: victimOccupation.trim(),
      dateOfDeath: new Date(dateOfDeath).toISOString(),
      placeOfDeath: placeOfDeath.trim(),
      biography: biography.trim() ? biography.trim() : undefined,
    };

    const policeReportPayload: UpsertPoliceReportPayload = {
      causeOfDeath: causeOfDeath.trim(),
      officerNotes: officerNotes.trim(),
      timeOfDeathStart: timeOfDeathStart
        ? new Date(timeOfDeathStart).toISOString()
        : undefined,
      timeOfDeathEnd: timeOfDeathEnd
        ? new Date(timeOfDeathEnd).toISOString()
        : undefined,
      isPublished: isReportPublished,
    };

    const res = await onSubmit({
      victim: victimPayload,
      policeReport: policeReportPayload,
    });

    setIsSubmitting(false);

    if (!res.success && res.error) {
      setFormError(res.error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 size={28} className="animate-spin text-red-600" />
        <p className="text-xs text-neutral-500 font-medium">
          Loading story and victim details...
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

      {/* Section 1: Victim Profile */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border border-red-100">
            <User size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Victim Profile
            </h2>
            <p className="text-[11px] text-neutral-500">
              Provide identity and background information about the deceased
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Victim Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Victim Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Eleanor Vance"
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
            />
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="150"
              required
              placeholder="e.g. 34"
              value={victimAge}
              onChange={(e) =>
                setVictimAge(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
            />
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Occupation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={120}
                placeholder="e.g. Chief Financial Officer"
                value={victimOccupation}
                onChange={(e) => setVictimOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Date of Death */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Date of Death <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dateOfDeath}
              onChange={(e) => setDateOfDeath(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
            />
          </div>

          {/* Place of Death */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Place / Discovery Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={250}
              placeholder="e.g. Master Bedroom, Penthouse 4B, Blackwood Manor"
              value={placeOfDeath}
              onChange={(e) => setPlaceOfDeath(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
            />
          </div>

          {/* Biography */}
          <div className="sm:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-800">
                Victim Biography & Background
              </label>
              <span className="text-[11px] text-neutral-400">
                {biography.length}/3000
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={3000}
              placeholder="Personal background, known relationships, and relevant history..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Police Report & Autopsy Findings */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Official Police & Coroner Report
              </h2>
              <p className="text-[11px] text-neutral-500">
                Autopsy findings and initial crime scene notes revealed to investigators
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isReportPublished}
              onChange={(e) => setIsReportPublished(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-300"
            />
            <span className="text-xs font-semibold text-neutral-700">
              Include in Case File
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Estimated Time of Death Start */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Estimated Time of Death (Earliest)
            </label>
            <input
              type="datetime-local"
              value={timeOfDeathStart}
              onChange={(e) => setTimeOfDeathStart(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
            />
            <span className="text-[11px] text-neutral-400 block">
              Estimated autopsy start window
            </span>
          </div>

          {/* Estimated Time of Death End */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Estimated Time of Death (Latest)
            </label>
            <input
              type="datetime-local"
              value={timeOfDeathEnd}
              onChange={(e) => setTimeOfDeathEnd(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
            />
            <span className="text-[11px] text-neutral-400 block">
              Estimated autopsy upper bound
            </span>
          </div>

          {/* Cause of Death */}
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-800">
                Cause of Death <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                {causeOfDeath.length}/1000
              </span>
            </div>
            <textarea
              rows={2}
              required
              maxLength={1000}
              placeholder="e.g. Asphyxiation due to toxic inhalation, or blunt force trauma to the occipital region..."
              value={causeOfDeath}
              onChange={(e) => setCauseOfDeath(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none resize-none"
            />
          </div>

          {/* Investigating Officer Notes */}
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-800">
                Investigating Officer Notes <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                {officerNotes.length}/5000
              </span>
            </div>
            <textarea
              rows={5}
              required
              maxLength={5000}
              placeholder="Detailed observations upon arrival: forced entry signs, room disorder, weather conditions, eyewitness first statements..."
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Basic Info</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Story Details...</span>
            </>
          ) : (
            <>
              <span>Next: Locations</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
