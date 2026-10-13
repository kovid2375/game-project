"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Shield,
  Award,
  CheckCircle,
  Clock,
  Zap,
  BookOpen,
  ChevronRight,
  User,
  Mail,
  Fingerprint,
  LogOut,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { authApi, UserResponse } from "@/lib/api/auth.api";
import { setAccessToken } from "@/lib/api/client";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoggedOut?: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onLoggedOut,
}: ProfileModalProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (err: unknown) {
      setError("Please log in to view your detective profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    }
    setAccessToken(null);
    setUser(null);
    if (onLoggedOut) {
      onLoggedOut();
    }
    onClose();
  };

  if (!isOpen) return null;

  // Extract initials for the avatar badge
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 3)
    : "DET";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c1017] border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#131923] border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#e50914]" />
            <h3 className="font-bebas text-xl text-white tracking-wider">
              DETECTIVE DOSSIER &amp; PROFILE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-7 h-7 text-[#e50914] animate-spin" />
              <p className="text-xs font-mono uppercase tracking-wider">
                Retrieving Bureau Records...
              </p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-zinc-400">{error}</p>
              <button
                onClick={fetchUserProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#e50914] hover:underline font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Identity Card displaying authenticated /auth/me payload */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#13171e] to-[#0d1017] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Avatar Badge */}
                  <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-[#e50914] flex items-center justify-center text-[#e50914] font-bebas text-2xl shadow-[0_0_20px_rgba(229,9,20,0.35)] shrink-0">
                    {initials}
                  </div>

                  {/* Detective Meta Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-white tracking-tight truncate">
                        {user?.name || "Agent"}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/40">
                        {user?.role || "PLAYER"}
                      </span>
                      {user?.isActive !== undefined && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                      {user?.email}
                    </p>

                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                      <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="truncate">ID: {user?.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detective Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[#13171e]/60 border border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">
                    Status
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    Verified
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#13171e]/60 border border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">
                    Clearance
                  </div>
                  <div className="text-base font-bold text-amber-400 mt-1">
                    Level 1
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#13171e]/60 border border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">
                    Syndicate
                  </div>
                  <div className="text-base font-bold text-[#e50914] mt-1">
                    CASEFILE
                  </div>
                </div>
              </div>

              {/* Active Assignment Section */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Current Investigation
                </div>
                <div className="p-3.5 rounded-lg bg-[#13171e] border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Case #01: The Docks Murders
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      Ready for briefing &amp; evidence interrogation
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#e50914] text-white rounded-lg hover:bg-[#ff1a25] transition-colors"
                  >
                    Open Case
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#10151e] border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
