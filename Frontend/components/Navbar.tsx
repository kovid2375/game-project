"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Menu, X, Shield, ChevronRight } from "lucide-react";

interface NavbarProps {
  onOpenProfile?: () => void;
  onOpenAuth?: (mode: "login" | "register") => void;
  onOpenSearch?: () => void;
}

export default function Navbar({
  onOpenProfile,
  onOpenAuth,
  onOpenSearch,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("cases");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Cases", href: "#cases", id: "cases" },
    { name: "How It Works", href: "#how-it-works", id: "how-it-works" },
    { name: "Reviews", href: "#reviews", id: "reviews" },
    { name: "FAQ", href: "#faq", id: "faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07090d]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-3"
          : "bg-gradient-to-b from-[#07090d]/90 via-[#07090d]/60 to-transparent backdrop-blur-[2px] py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* LOGO */}
          <Link
            href="/"
            className="group flex items-center gap-1.5 focus:outline-none"
            aria-label="CASEFILE Homepage"
          >
            <div className="flex items-baseline font-takeashot tracking-wider text-2xl sm:text-3xl leading-none">
              <span className="text-white group-hover:text-zinc-200 transition-colors drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
                CASE
              </span>
              <span className="text-[#e50914] group-hover:text-[#ff1a25] transition-colors drop-shadow-[0_0_12px_rgba(229,9,20,0.5)]">
                FILE
              </span>
              <span className="text-[10px] sm:text-xs text-[#e50914] ml-0.5 font-sans font-bold -top-2 relative">
                ®
              </span>
            </div>
            {/* Detective Badge Icon dot */}
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#e50914] shadow-[0_0_6px_#e50914] ml-1 group-hover:scale-125 transition-transform"></span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 relative group ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#e50914] rounded-full shadow-[0_0_8px_#e50914]" />
                  )}
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-red-500/40 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </a>
              );
            })}
          </nav>

          {/* RIGHT CONTROLS: SEARCH, PROFILE, LOGIN, GET STARTED */}
          <div className="hidden lg:flex items-center space-x-3.5">
            {/* My Profile */}
            <button
              onClick={onOpenProfile}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide uppercase font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-md transition-all border border-transparent hover:border-zinc-700/50"
            >
              <Shield className="w-3.5 h-3.5 text-[#e50914]" />
              <span>My Profile</span>
            </button>

            {/* Log In */}
            <button
              onClick={() => onOpenAuth?.("login")}
              type="button"
              className="px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold text-zinc-200 hover:text-white bg-black/40 hover:bg-white/[0.08] border border-white/15 rounded-md transition-all"
            >
              Log In
            </button>

            {/* Get Started Button */}
            <button
              onClick={() => onOpenAuth?.("register")}
              type="button"
              className="px-4 py-1.5 text-xs uppercase tracking-wider font-bold text-white bg-[#e50914] hover:bg-[#ff1a25] btn-red-glow rounded-md transition-all flex items-center gap-1"
            >
              <span>Get Started</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 text-zinc-300 hover:text-white"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0d14]/98 border-b border-zinc-800 shadow-2xl backdrop-blur-xl px-5 pt-3 pb-6 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2 mb-4">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-base font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-md transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-zinc-200 bg-zinc-900 border border-zinc-700/60 rounded-md"
            >
              <Shield className="w-4 h-4 text-[#e50914]" />
              My Profile
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth?.("login");
                }}
                className="py-2.5 text-sm font-semibold text-zinc-200 bg-white/5 border border-white/15 rounded-md hover:bg-white/10"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth?.("register");
                }}
                className="py-2.5 text-sm font-bold text-white bg-[#e50914] btn-red-glow rounded-md"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
