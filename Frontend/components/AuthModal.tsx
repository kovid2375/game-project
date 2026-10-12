"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
  onSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  mode,
  onClose,
  onSwitchMode,
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [badgeId, setBadgeId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d1118] border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Top styling bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141b26] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#e50914]" />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold">
              {mode === "login" ? "BUREAU AUTHENTICATION" : "NEW AGENT ENROLLMENT"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bebas text-white tracking-wide">
              {mode === "login" ? "ACCESS INVESTIGATION HQ" : "COMMENCE YOUR FIRST CASE"}
            </h3>
            <p className="text-xs text-zinc-400 font-normal mt-1 leading-relaxed">
              {mode === "login"
                ? "Enter your detective credentials to review ongoing cases and syndicate scores."
                : "Create your free detective profile. Unlocks Case #01: The Docks Murders with zero cost."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Detective Alias / Call Sign
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="e.g. Inspector Holmes"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2.5 pl-9 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Official Bureau Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="detective@casefile.game"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2.5 pl-9 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Encrypted Passkey
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2.5 pl-9 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#e50914] hover:bg-[#ff1a25] btn-red-glow rounded transition-all mt-2 flex items-center justify-center gap-2"
            >
              <span>{mode === "login" ? "Verify Credentials" : "Issue Detective Badge"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch link */}
          <div className="mt-5 text-center text-xs text-zinc-400">
            {mode === "login" ? (
              <span>
                Don&apos;t have an assigned badge yet?{" "}
                <button
                  type="button"
                  onClick={() => onSwitchMode("register")}
                  className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 ml-1"
                >
                  Get Started (First Case Free)
                </button>
              </span>
            ) : (
              <span>
                Already an authorized investigator?{" "}
                <button
                  type="button"
                  onClick={() => onSwitchMode("login")}
                  className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 ml-1"
                >
                  Log In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
