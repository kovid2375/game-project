"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Lock,
  Eye,
  Crosshair,
  Image as ImageIcon,
  Loader2,
  FileText,
  Tag,
  Paperclip,
} from "lucide-react";
import {
  CaseLocation,
  LocationClue,
  LocationDocument,
  UpdateLocationPayload,
} from "@/lib/api/cases.api";

interface LocationEditorPanelProps {
  location: CaseLocation;
  clues: LocationClue[];
  documents: LocationDocument[];
  isLoadingClues: boolean;
  onClose: () => void;
  onUpdateLocation: (payload: UpdateLocationPayload) => Promise<boolean>;
  onDeleteLocation: () => Promise<boolean>;
  onAddClue: (clue: {
    title: string;
    description: string;
    imageUrl?: string;
  }) => Promise<boolean>;
  onDeleteClue: (clueId: string) => Promise<boolean>;
  onAddDocument: (doc: {
    title: string;
    description: string;
    content?: string;
    fileUrl?: string;
  }) => Promise<boolean>;
  onDeleteDocument: (docId: string) => Promise<boolean>;
  onUploadImage: (file: File) => Promise<{ url?: string; error?: string }>;
}

export default function LocationEditorPanel({
  location,
  clues,
  documents,
  isLoadingClues,
  onClose,
  onUpdateLocation,
  onDeleteLocation,
  onAddClue,
  onDeleteClue,
  onAddDocument,
  onDeleteDocument,
  onUploadImage,
}: LocationEditorPanelProps) {
  const [name, setName] = useState(location.name);
  const [description, setDescription] = useState(location.description);
  const [imageUrl, setImageUrl] = useState(location.imageUrl || "");
  const [mapX, setMapX] = useState<number>(location.mapX ?? 50);
  const [mapY, setMapY] = useState<number>(location.mapY ?? 50);
  const [isInitiallyOpen, setIsInitiallyOpen] = useState(
    location.isInitiallyOpen
  );
  const [isDeadEnd, setIsDeadEnd] = useState(location.isDeadEnd ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Clue modal / form state
  const [isAddingClue, setIsAddingClue] = useState(false);
  const [newClueTitle, setNewClueTitle] = useState("");
  const [newClueDesc, setNewClueDesc] = useState("");
  const [newClueImage, setNewClueImage] = useState("");

  // Document modal / form state
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDesc, setNewDocDesc] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if selected location changes
  React.useEffect(() => {
    setName(location.name);
    setDescription(location.description);
    setImageUrl(location.imageUrl || "");
    setMapX(location.mapX ?? 50);
    setMapY(location.mapY ?? 50);
    setIsInitiallyOpen(location.isInitiallyOpen);
    setIsDeadEnd(location.isDeadEnd ?? false);
  }, [location.id]);

  const handleImageFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const res = await onUploadImage(file);
    setIsUploading(false);
    if (res.url) {
      setImageUrl(res.url);
      await onUpdateLocation({ imageUrl: res.url });
    }
  };

  const handleSaveFields = async () => {
    setIsSaving(true);
    await onUpdateLocation({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      mapX: Number(mapX),
      mapY: Number(mapY),
      isInitiallyOpen,
      isDeadEnd,
    });
    setIsSaving(false);
  };

  const handleCreateClueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClueTitle.trim() || !newClueDesc.trim()) return;
    const ok = await onAddClue({
      title: newClueTitle.trim(),
      description: newClueDesc.trim(),
      imageUrl: newClueImage.trim() || undefined,
    });
    if (ok) {
      setNewClueTitle("");
      setNewClueDesc("");
      setNewClueImage("");
      setIsAddingClue(false);
    }
  };

  const handleCreateDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocDesc.trim()) return;
    const ok = await onAddDocument({
      title: newDocTitle.trim(),
      description: newDocDesc.trim(),
      content: newDocContent.trim() || undefined,
    });
    if (ok) {
      setNewDocTitle("");
      setNewDocDesc("");
      setNewDocContent("");
      setIsAddingDoc(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900">Location Details</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
        {/* Banner image preview */}
        <div className="relative aspect-video w-full rounded-xl bg-neutral-900 overflow-hidden group border border-neutral-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-xs gap-1.5 bg-neutral-100">
              <ImageIcon size={28} strokeWidth={1.5} />
              <span>No image uploaded</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20">
              <Loader2 size={28} className="animate-spin text-red-500" />
              <p className="text-xs font-semibold text-white tracking-wide">
                Uploading location map…
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
              }
            }}
          />

          {!isUploading && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/75 hover:bg-black/90 text-white rounded-lg text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <ImageIcon size={13} />
              <span>{imageUrl ? "Change Image" : "Upload Image"}</span>
            </button>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-800">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveFields}
            className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all font-medium"
          />
        </div>

        {/* Status / Visibility */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={isInitiallyOpen ? "open" : "locked"}
              onChange={(e) => {
                const isOpen = e.target.value === "open";
                setIsInitiallyOpen(isOpen);
                onUpdateLocation({ isInitiallyOpen: isOpen });
              }}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="open">🟢 Visible to Players</option>
              <option value="locked">🔒 Locked (Unlockable)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-800">
              Type
            </label>
            <select
              value={isDeadEnd ? "deadend" : "standard"}
              onChange={(e) => {
                const isDead = e.target.value === "deadend";
                setIsDeadEnd(isDead);
                onUpdateLocation({ isDeadEnd: isDead });
              }}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="standard">📍 Crime Scene / Venue</option>
              <option value="deadend">🚫 Dead End</option>
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-800">
              Short Description <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-neutral-400">
              {description.length}/3000
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSaveFields}
            className="w-full px-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all resize-none"
          />
        </div>

        {/* Map Position (X & Y Coordinates: 0-100%) */}
        <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
              <Crosshair size={14} className="text-red-600" />
              <span>Map Position (%)</span>
            </div>
            <span className="text-[10px] text-neutral-400">
              Drag marker or enter %
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-neutral-500 block mb-1">
                X Coordinate (0-100%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={mapX}
                onChange={(e) => setMapX(Number(e.target.value))}
                onBlur={handleSaveFields}
                className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-mono font-bold text-neutral-800 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block mb-1">
                Y Coordinate (0-100%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={mapY}
                onChange={(e) => setMapY(Number(e.target.value))}
                onBlur={handleSaveFields}
                className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-mono font-bold text-neutral-800 outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Connected Clues */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag size={13} className="text-red-600" />
              <span className="text-xs font-bold text-neutral-800">
                Connected Clues ({clues.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingClue(!isAddingClue)}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>{isAddingClue ? "Cancel" : "Add Clue"}</span>
            </button>
          </div>

          {/* Add clue mini form */}
          {isAddingClue && (
            <form
              onSubmit={handleCreateClueSubmit}
              className="p-3 bg-red-50/50 rounded-xl border border-red-200/80 space-y-2 text-xs"
            >
              <input
                type="text"
                required
                placeholder="Clue Title (e.g. Bloody Knife)"
                value={newClueTitle}
                onChange={(e) => setNewClueTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-red-500"
              />
              <textarea
                rows={2}
                required
                placeholder="Description of the clue..."
                value={newClueDesc}
                onChange={(e) => setNewClueDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-red-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs shadow cursor-pointer"
                >
                  Save Clue
                </button>
              </div>
            </form>
          )}

          {/* Clues list */}
          <div className="space-y-1.5">
            {clues.length === 0 ? (
              <p className="text-[11px] text-neutral-400 py-1 italic">
                No clues attached to this location yet.
              </p>
            ) : (
              clues.map((clue, idx) => (
                <div
                  key={clue.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-neutral-900 truncate">
                        {clue.title}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {clue.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteClue(clue.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Location Documents */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-blue-600" />
              <span className="text-xs font-bold text-neutral-800">
                Documents ({documents.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingDoc(!isAddingDoc)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>{isAddingDoc ? "Cancel" : "Add Document"}</span>
            </button>
          </div>

          {/* Add document form */}
          {isAddingDoc && (
            <form
              onSubmit={handleCreateDocSubmit}
              className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2 text-xs"
            >
              <input
                type="text"
                required
                placeholder="Document Title (e.g. Flight Manifest)"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-blue-500"
              />
              <textarea
                rows={2}
                required
                placeholder="Description of the document..."
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow cursor-pointer"
                >
                  Save Document
                </button>
              </div>
            </form>
          )}

          {/* Documents list */}
          <div className="space-y-1.5">
            {documents.length === 0 ? (
              <p className="text-[11px] text-neutral-400 py-1 italic">
                No documents attached to this location.
              </p>
            ) : (
              documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-neutral-900 truncate">
                        {doc.title}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete Location Button */}
        <div className="pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onDeleteLocation}
            className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
