"use client";

import React, { useRef, useState } from "react";
import {
  MapPin,
  Lock,
  Eye,
  Plus,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
} from "lucide-react";
import { CaseLocation } from "@/lib/api/cases.api";

interface InteractiveLocationMapProps {
  locations: CaseLocation[];
  selectedLocationId: string | null;
  onSelectLocation: (location: CaseLocation) => void;
  onUpdateCoordinates: (
    locationId: string,
    x: number,
    y: number
  ) => Promise<boolean>;
  mapStyle?: "dark" | "light" | "blueprint";
}

export default function InteractiveLocationMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  onUpdateCoordinates,
  mapStyle = "dark",
}: InteractiveLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [draggedLocationId, setDraggedLocationId] = useState<string | null>(
    null
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  // Background map theme styling
  const mapBackgroundClass =
    mapStyle === "dark"
      ? "bg-slate-950"
      : mapStyle === "blueprint"
      ? "bg-blue-950"
      : "bg-slate-900";

  // Handle map click to reposition currently selected location
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedLocationId || !mapContainerRef.current) return;

    // Check if clicked directly on marker
    if ((e.target as HTMLElement).closest(".map-marker-btn")) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = Math.round(
      Math.max(0, Math.min(100, (clickX / rect.width) * 100))
    );
    const percentY = Math.round(
      Math.max(0, Math.min(100, (clickY / rect.height) * 100))
    );

    onUpdateCoordinates(selectedLocationId, percentX, percentY);
  };

  // Marker drag handlers
  const handleDragStart = (
    e: React.MouseEvent,
    location: CaseLocation
  ) => {
    e.stopPropagation();
    setDraggedLocationId(location.id);
    onSelectLocation(location);

    const container = mapContainerRef.current;
    if (!container) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;

      const pX = Math.round(Math.max(2, Math.min(98, (x / rect.width) * 100)));
      const pY = Math.round(Math.max(2, Math.min(98, (y / rect.height) * 100)));

      location.mapX = pX;
      location.mapY = pY;
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setDraggedLocationId(null);

      const rect = container.getBoundingClientRect();
      const x = upEvent.clientX - rect.left;
      const y = upEvent.clientY - rect.top;

      const finalX = Math.round(
        Math.max(2, Math.min(98, (x / rect.width) * 100))
      );
      const finalY = Math.round(
        Math.max(2, Math.min(98, (y / rect.height) * 100))
      );

      onUpdateCoordinates(location.id, finalX, finalY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={mapContainerRef}
      onClick={handleMapClick}
      className={`relative w-full h-[540px] lg:h-[620px] rounded-2xl overflow-hidden border border-neutral-800 shadow-xl select-none cursor-crosshair ${mapBackgroundClass}`}
    >
      {/* City Map Cyber / Noir Illustration Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity"
        style={{ backgroundImage: `url('/how_step2_map.jpg')` }}
      />

      {/* Grid Lines Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Radar Scanline Accent */}
      <div className="absolute inset-0 bg-radial from-red-500/5 via-transparent to-black/60 pointer-events-none" />

      {/* Map Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-black/70 backdrop-blur-md rounded-xl p-1 border border-white/10 flex flex-col gap-1 shadow-lg">
          <button
            type="button"
            title="Zoom In"
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            title="Zoom Out"
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut size={15} />
          </button>
        </div>
      </div>

      {/* Hint Banner on map */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-white/70 flex items-center gap-2 font-mono">
          <Crosshair size={13} className="text-red-500 shrink-0" />
          <span>Click anywhere to place or drag markers to position</span>
        </div>
      </div>

      {/* Location Markers */}
      {locations.map((loc, idx) => {
        const isSelected = loc.id === selectedLocationId;
        const posX = loc.mapX ?? (20 + (idx * 15) % 65);
        const posY = loc.mapY ?? (20 + (idx * 18) % 60);

        return (
          <div
            key={loc.id}
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
              transform: `translate(-50%, -50%) scale(${isSelected ? 1.05 : 1})`,
            }}
            onMouseDown={(e) => handleDragStart(e, loc)}
            className="absolute z-10 transition-transform duration-150 cursor-grab active:cursor-grabbing map-marker-btn"
          >
            {/* Pulsing ring for selected location */}
            {isSelected && (
              <span className="absolute -inset-3 rounded-2xl bg-red-500/25 animate-ping pointer-events-none" />
            )}

            {/* Marker Card Box */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md border shadow-2xl transition-all ${
                isSelected
                  ? "bg-red-600 text-white border-red-400 ring-4 ring-red-500/20"
                  : "bg-black/85 text-white border-white/15 hover:border-white/35 hover:bg-black/95"
              }`}
            >
              {/* Icon badge */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isSelected
                    ? "bg-white text-red-600"
                    : loc.isInitiallyOpen
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {loc.isInitiallyOpen ? (
                  <MapPin size={13} />
                ) : (
                  <Lock size={12} />
                )}
              </div>

              {/* Title & Status */}
              <div className="text-left pr-1 min-w-[80px] max-w-[140px]">
                <p className="text-xs font-bold leading-tight truncate">
                  {loc.name}
                </p>
                <p
                  className={`text-[10px] uppercase font-mono font-semibold tracking-wider ${
                    isSelected
                      ? "text-red-100"
                      : loc.isInitiallyOpen
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {loc.isInitiallyOpen ? "Visible" : "Locked"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
