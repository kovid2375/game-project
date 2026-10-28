"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  Lock,
  Eye,
  Trash2,
  Edit2,
  Tag,
  FileText,
  Loader2,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import {
  CaseLocation,
  LocationClue,
  LocationDocument,
  CreateLocationPayload,
  UpdateLocationPayload,
  casesApi,
} from "@/lib/api/cases.api";
import InteractiveLocationMap from "./InteractiveLocationMap";
import LocationEditorPanel from "./LocationEditorPanel";

interface Step3LocationsProps {
  caseId: string;
  onBack: () => void;
  onNext: () => void;
}

export default function Step3Locations({
  caseId,
  onBack,
  onNext,
}: Step3LocationsProps) {
  const [locations, setLocations] = useState<CaseLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<CaseLocation | null>(
    null
  );
  const [clues, setClues] = useState<LocationClue[]>([]);
  const [documents, setDocuments] = useState<LocationDocument[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClues, setIsLoadingClues] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // New location modal
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocDesc, setNewLocDesc] = useState("");
  const [newLocIsOpen, setNewLocIsOpen] = useState(true);
  const [isCreatingSubmitting, setIsCreatingSubmitting] = useState(false);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const data = await casesApi.getLocations(caseId);
      setLocations(data);
      if (data.length > 0 && !selectedLocation) {
        setSelectedLocation(data[0]);
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (caseId && caseId !== "draft") {
      fetchLocations();
    } else {
      setIsLoading(false);
    }
  }, [caseId]);

  // Fetch clues & documents when selected location changes
  useEffect(() => {
    if (!caseId || !selectedLocation?.id) {
      setClues([]);
      setDocuments([]);
      return;
    }

    let isMounted = true;
    setIsLoadingClues(true);

    Promise.all([
      casesApi.getClues(caseId, selectedLocation.id).catch(() => []),
      casesApi.getDocuments(caseId, selectedLocation.id).catch(() => []),
    ])
      .then(([cList, dList]) => {
        if (isMounted) {
          setClues(cList);
          setDocuments(dList);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingClues(false);
      });

    return () => {
      isMounted = false;
    };
  }, [caseId, selectedLocation?.id]);

  // Add location handler
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocDesc.trim()) return;

    setIsCreatingSubmitting(true);
    try {
      const created = await casesApi.createLocation(caseId, {
        name: newLocName.trim(),
        description: newLocDesc.trim(),
        isInitiallyOpen: newLocIsOpen,
        mapX: 45 + Math.floor(Math.random() * 10),
        mapY: 45 + Math.floor(Math.random() * 10),
      });

      setLocations((prev) => [...prev, created]);
      setSelectedLocation(created);
      setIsCreatingModal(false);
      setNewLocName("");
      setNewLocDesc("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create location");
    } finally {
      setIsCreatingSubmitting(false);
    }
  };

  // Update location handler
  const handleUpdateLocation = async (payload: UpdateLocationPayload) => {
    if (!selectedLocation) return false;
    try {
      const updated = await casesApi.updateLocation(
        caseId,
        selectedLocation.id,
        payload
      );
      setSelectedLocation(updated);
      setLocations((prev) =>
        prev.map((loc) => (loc.id === updated.id ? updated : loc))
      );
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update location");
      return false;
    }
  };

  // Delete location handler
  const handleDeleteLocation = async () => {
    if (!selectedLocation) return false;
    if (
      !confirm(
        `Are you sure you want to delete "${selectedLocation.name}"? All associated clues and documents will be removed.`
      )
    ) {
      return false;
    }

    try {
      await casesApi.deleteLocation(caseId, selectedLocation.id);
      const remaining = locations.filter(
        (loc) => loc.id !== selectedLocation.id
      );
      setLocations(remaining);
      setSelectedLocation(remaining[0] || null);
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete location");
      return false;
    }
  };

  // Clues actions
  const handleAddClue = async (clueData: {
    title: string;
    description: string;
    imageUrl?: string;
  }) => {
    if (!selectedLocation) return false;
    try {
      const created = await casesApi.createClue(
        caseId,
        selectedLocation.id,
        clueData
      );
      setClues((prev) => [...prev, created]);
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to attach clue");
      return false;
    }
  };

  const handleDeleteClue = async (clueId: string) => {
    if (!selectedLocation) return false;
    try {
      await casesApi.deleteClue(caseId, selectedLocation.id, clueId);
      setClues((prev) => prev.filter((c) => c.id !== clueId));
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete clue");
      return false;
    }
  };

  // Documents actions
  const handleAddDocument = async (docData: {
    title: string;
    description: string;
    content?: string;
    fileUrl?: string;
  }) => {
    if (!selectedLocation) return false;
    try {
      const created = await casesApi.createDocument(
        caseId,
        selectedLocation.id,
        docData
      );
      setDocuments((prev) => [...prev, created]);
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to attach document");
      return false;
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedLocation) return false;
    try {
      await casesApi.deleteDocument(caseId, selectedLocation.id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete document");
      return false;
    }
  };

  // Upload image handler
  const handleUploadImage = async (file: File) => {
    try {
      const res = await casesApi.uploadCover(file);
      return { url: res.url };
    } catch (err: any) {
      return {
        error: err.response?.data?.message || "Image upload failed",
      };
    }
  };

  // Coordinates drag updater
  const handleUpdateCoordinates = async (
    locationId: string,
    x: number,
    y: number
  ) => {
    try {
      const updated = await casesApi.updateLocation(caseId, locationId, {
        mapX: x,
        mapY: y,
      });
      setLocations((prev) =>
        prev.map((loc) => (loc.id === updated.id ? updated : loc))
      );
      if (selectedLocation?.id === updated.id) {
        setSelectedLocation(updated);
      }
      return true;
    } catch (err) {
      console.error("Failed to update coordinates:", err);
      return false;
    }
  };

  // Filtered locations
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalLocationsCount = locations.length;
  const visibleCount = locations.filter((l) => l.isInitiallyOpen).length;
  const lockedCount = locations.filter((l) => !l.isInitiallyOpen).length;
  const totalCluesCount = clues.length;

  return (
    <div className="space-y-6">
      {/* ── Top Stat Cards (Matches Reference Screenshot) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Locations */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {totalLocationsCount}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Total Locations
            </span>
          </div>
        </div>

        {/* Visible to Players */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Eye size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {visibleCount}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Visible to Players
            </span>
          </div>
        </div>

        {/* Locked (Unlockable) */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Lock size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {lockedCount}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Locked (Unlockable)
            </span>
          </div>
        </div>

        {/* Connected Clues */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Tag size={20} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 leading-none block">
              {totalCluesCount}
            </span>
            <span className="text-xs text-neutral-500 font-medium mt-0.5 block">
              Connected Clues
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Workspace 3-Column Layout (Locations List | Map/List View | Inspector Panel) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Locations Directory (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">
              Locations ({locations.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Location</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
            <Search size={14} className="text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-neutral-800 placeholder-neutral-400 text-xs"
            />
          </div>

          {/* Location Cards Scroll Area */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                <Loader2 size={18} className="animate-spin mx-auto mb-2 text-red-600" />
                <span>Loading locations...</span>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                <span>No locations found. Click &quot;+ Add Location&quot; to create one.</span>
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-50/40 border-red-300 ring-2 ring-red-500/10 shadow-xs"
                        : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 shrink-0 overflow-hidden border border-neutral-200 relative">
                      {loc.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={loc.imageUrl}
                          alt={loc.name}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">
                          <MapPin size={16} />
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {loc.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            loc.isInitiallyOpen
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              loc.isInitiallyOpen
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span>
                            {loc.isInitiallyOpen ? "Visible" : "Locked"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Map & View Switcher (5 or 6 cols depending on inspector) */}
        <div
          className={`${
            selectedLocation ? "lg:col-span-5" : "lg:col-span-9"
          } space-y-4`}
        >
          {/* View Toolbar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "map"
                    ? "bg-red-600 text-white shadow"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Map View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-red-600 text-white shadow"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                List View
              </button>
            </div>

            <span className="text-xs text-neutral-400 font-mono">
              Interactive Noir City Grid
            </span>
          </div>

          {/* Interactive Map Canvas */}
          {viewMode === "map" ? (
            <InteractiveLocationMap
              locations={locations}
              selectedLocationId={selectedLocation?.id || null}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              onUpdateCoordinates={handleUpdateCoordinates}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                All Locations Summary
              </h4>
              <div className="space-y-2">
                {locations.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLocation(l)}
                    className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-neutral-900">
                        {l.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {l.description}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">
                      ({l.mapX}%, {l.mapY}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Location Details & Clues Inspector (4 cols) */}
        {selectedLocation && (
          <div className="lg:col-span-4 h-full">
            <LocationEditorPanel
              location={selectedLocation}
              clues={clues}
              documents={documents}
              isLoadingClues={isLoadingClues}
              onClose={() => setSelectedLocation(null)}
              onUpdateLocation={handleUpdateLocation}
              onDeleteLocation={handleDeleteLocation}
              onAddClue={handleAddClue}
              onDeleteClue={handleDeleteClue}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onUploadImage={handleUploadImage}
            />
          </div>
        )}
      </div>

      {/* ── Add Location Modal ── */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Add New Location
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victim's Apartment or Abandoned Warehouse"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Atmosphere, points of interest, initial state..."
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="locIsOpen"
                  checked={newLocIsOpen}
                  onChange={(e) => setNewLocIsOpen(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-300 cursor-pointer"
                />
                <label
                  htmlFor="locIsOpen"
                  className="font-medium text-neutral-700 cursor-pointer"
                >
                  Visible to players from the start of the case
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
                  <span>Create Location</span>
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
          <span>Back to Story & Details</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer"
        >
          <span>Next: Suspects</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
