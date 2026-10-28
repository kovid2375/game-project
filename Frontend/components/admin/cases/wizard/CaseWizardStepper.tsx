"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  id: number;
  label: string;
}

export const CASE_WIZARD_STEPS: StepItem[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Story & Details" },
  { id: 3, label: "Locations" },
  { id: 4, label: "Suspects" },
  { id: 5, label: "Clues & Evidence" },
  { id: 6, label: "Review" },
];

interface CaseWizardStepperProps {
  currentStep: number;
  maxStepAllowed?: number;
  onStepClick?: (stepId: number) => void;
}

export default function CaseWizardStepper({
  currentStep,
  maxStepAllowed = 1,
  onStepClick,
}: CaseWizardStepperProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <nav aria-label="Progress" className="flex items-center gap-2 min-w-max">
        {CASE_WIZARD_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isClickable = Boolean(onStepClick && step.id <= maxStepAllowed);

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick && onStepClick(step.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-red-50 text-red-600 border border-red-200/80 shadow-xs ring-2 ring-red-500/10"
                  : isCompleted
                  ? "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300"
                  : "bg-white/60 text-neutral-400 border border-neutral-100 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : isCompleted
                    ? "bg-neutral-800 text-white"
                    : "border border-neutral-300 text-neutral-400"
                }`}
              >
                {isCompleted ? <Check size={12} strokeWidth={2.5} /> : step.id}
              </span>
              <span className={isActive ? "font-semibold text-red-600" : ""}>
                {step.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
