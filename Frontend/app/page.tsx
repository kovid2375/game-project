"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EvidenceModal from "@/components/EvidenceModal";
import ProfileModal from "@/components/ProfileModal";
import SearchModal from "@/components/SearchModal";
import AuthModal from "@/components/AuthModal";
import CasesSection from "@/components/CasesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ReviewsSection from "@/components/ReviewsSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export default function Home() {
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedClue, setSelectedClue] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "login" | "register";
  }>({
    isOpen: false,
    mode: "register",
  });

  const handleStartInvestigating = () => {
    setSelectedClue("primary-case");
    setIsEvidenceModalOpen(true);
  };

  const handleSelectClue = (clueId: string) => {
    setSelectedClue(clueId);
    setIsEvidenceModalOpen(true);
  };

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleOpenCase = (caseId: string) => {
    setSelectedClue(caseId);
    setIsEvidenceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100 flex flex-col font-sans selection:bg-red-600/30 selection:text-red-200">
      {/* NAVBAR */}
      <Navbar
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* HERO SECTION */}
      <main className="flex-1">
        <Hero
          onStartInvestigating={handleStartInvestigating}
          onSelectClue={handleSelectClue}
        />

        {/* CASES SECTION */}
        <CasesSection onSelectCase={handleOpenCase} />

        {/* HOW IT WORKS SECTION */}
        <HowItWorksSection onStartInvestigating={handleStartInvestigating} />

        {/* REVIEWS SECTION */}
        <ReviewsSection />

        {/* FAQ SECTION */}
        <FaqSection />
      </main>

      {/* FOOTER */}
      <Footer />

      {/* INTERACTIVE MODALS */}
      {/* <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        clueId={selectedClue}
        onLaunchCase={() => {
          setIsEvidenceModalOpen(false);
          setAuthModal({ isOpen: true, mode: "register" });
        }}
      /> */}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectCase={handleOpenCase}
      />

      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: "login" })}
        onSwitchMode={(mode) => setAuthModal({ isOpen: true, mode })}
        onSuccess={() => {
          setIsProfileModalOpen(true);
        }}
      />
    </div>
  );
}
