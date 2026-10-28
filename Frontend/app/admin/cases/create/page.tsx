"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import CaseWizardStepper, {
  CASE_WIZARD_STEPS,
} from "@/components/admin/cases/wizard/CaseWizardStepper";
import Step1BasicInfo, {
  Step1FormData,
} from "@/components/admin/cases/wizard/Step1BasicInfo";
import Step2StoryDetails from "@/components/admin/cases/wizard/Step2StoryDetails";
import Step3Locations from "@/components/admin/cases/wizard/Step3Locations";
import Step4Suspects from "@/components/admin/cases/wizard/Step4Suspects";
import Step5CluesEvidence from "@/components/admin/cases/wizard/Step5CluesEvidence";
import Step6ReviewPublish from "@/components/admin/cases/wizard/Step6ReviewPublish";
import {
  casesApi,
  AdminCase,
  CaseVictim,
  PoliceReport,
  CaseLocation,
  CaseSuspect,
  CaseSolution,
  UpsertVictimPayload,
  UpsertPoliceReportPayload,
} from "@/lib/api/cases.api";

export default function CreateCaseWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const caseIdFromUrl = searchParams.get("caseId");
  const stepFromUrl = Number(searchParams.get("step")) || 1;

  const [currentStep, setCurrentStep] = useState(stepFromUrl);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(
    caseIdFromUrl
  );
  const [caseData, setCaseData] = useState<AdminCase | null>(null);

  // Draft state kept in memory until Step 6 for new cases
  const [draftStep1, setDraftStep1] = useState<Step1FormData | null>(null);
  const [draftVictim, setDraftVictim] = useState<UpsertVictimPayload | null>(
    null
  );
  const [draftPoliceReport, setDraftPoliceReport] =
    useState<UpsertPoliceReportPayload | null>(null);

  // Step 2 Data
  const [victimData, setVictimData] = useState<CaseVictim | null>(null);
  const [policeReportData, setPoliceReportData] =
    useState<PoliceReport | null>(null);
  const [isLoadingStep2, setIsLoadingStep2] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    if (stepFromUrl) {
      setCurrentStep(stepFromUrl);
    }
    if (caseIdFromUrl) {
      setCreatedCaseId(caseIdFromUrl);
    }
  }, [stepFromUrl, caseIdFromUrl]);

  // Load existing case data if editing an existing case
  useEffect(() => {
    if (!createdCaseId) return;

    let isMounted = true;

    casesApi
      .getCase(createdCaseId)
      .then((data) => {
        if (isMounted) setCaseData(data);
      })
      .catch((err) => {
        console.error("Failed to fetch case:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [createdCaseId]);

  // Load Step 2 Data when editing an existing case
  useEffect(() => {
    if (!createdCaseId || currentStep !== 2) return;

    let isMounted = true;
    setIsLoadingStep2(true);

    Promise.all([
      casesApi.getVictim(createdCaseId).catch(() => null),
      casesApi.getPoliceReport(createdCaseId).catch(() => null),
    ])
      .then(([victim, report]) => {
        if (isMounted) {
          setVictimData(victim);
          setPoliceReportData(report);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingStep2(false);
      });

    return () => {
      isMounted = false;
    };
  }, [createdCaseId, currentStep]);

  // Handle Step 1 Submit:
  // If editing: updates backend immediately.
  // If creating new: creates an unpublished draft case in backend to get a valid case UUID!
  const handleStep1Submit = async (formData: Step1FormData) => {
    try {
      if (createdCaseId) {
        const updated = await casesApi.updateCase(createdCaseId, {
          caseNumber: Number(formData.caseNumber),
          title: formData.title,
          description: formData.description,
          coverImageUrl: formData.coverImageUrl,
          priceInRupees: Number(formData.priceInRupees),
        });
        setCaseData(updated);
        setCurrentStep(2);
        router.push(`/admin/cases/create?caseId=${createdCaseId}&step=2`);
        return { success: true };
      } else {
        // Create the case in the backend to establish a valid UUID for subsequent steps
        const created = await casesApi.createCase({
          caseNumber: Number(formData.caseNumber),
          title: formData.title,
          description: formData.description,
          coverImageUrl: formData.coverImageUrl,
          priceInRupees: Number(formData.priceInRupees),
        });
        setCreatedCaseId(created.id);
        setCaseData(created);
        setCurrentStep(2);
        router.push(`/admin/cases/create?caseId=${created.id}&step=2`);
        return { success: true };
      }
    } catch (err: any) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to save basic case details.",
      };
    }
  };

  // Handle Step 2 Submit:
  // If editing: updates backend immediately.
  // If creating new: stores in draft state without touching database!
  const handleStep2Submit = async (data: {
    victim: UpsertVictimPayload;
    policeReport: UpsertPoliceReportPayload;
  }) => {
    try {
      if (createdCaseId) {
        const [savedVictim, savedReport] = await Promise.all([
          casesApi.upsertVictim(createdCaseId, data.victim),
          casesApi.upsertPoliceReport(createdCaseId, data.policeReport),
        ]);
        setVictimData(savedVictim);
        setPoliceReportData(savedReport);
        setCurrentStep(3);
        router.push(`/admin/cases/create?caseId=${createdCaseId}&step=3`);
        return { success: true };
      } else {
        // Option A: Store in draft state in memory — NO database write yet!
        setDraftVictim(data.victim);
        setDraftPoliceReport(data.policeReport);
        setCurrentStep(3);
        router.push(`/admin/cases/create?step=3`);
        return { success: true };
      }
    } catch (err: any) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to save story & police report details.",
      };
    }
  };

  const handleUploadCover = async (file: File) => {
    try {
      const res = await casesApi.uploadCover(file);
      return { url: res.url };
    } catch (err: any) {
      return {
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to upload image.",
      };
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    if (createdCaseId) {
      router.push(`/admin/cases/create?caseId=${createdCaseId}&step=${stepId}`);
    } else {
      router.push(`/admin/cases/create?step=${stepId}`);
    }
  };

  // Helper when on Step 6 for new case: create full bundle atomically
  const handleFinalBundleCreation = async (
    bundleData: any,
    publishAfter: boolean
  ) => {
    try {
      const payload = {
        caseNumber: Number(draftStep1?.caseNumber || 1),
        title: draftStep1?.title || "Untitled Case",
        description: draftStep1?.description || "",
        coverImageUrl: draftStep1?.coverImageUrl || "",
        priceInRupees: Number(draftStep1?.priceInRupees || 0),
        isPublished: publishAfter,
        victim: draftVictim || undefined,
        policeReport: draftPoliceReport || undefined,
        locations: bundleData.locations || [],
        suspects: bundleData.suspects || [],
        solution: bundleData.solution || undefined,
      };

      const created = await casesApi.createCaseBundle(payload);
      setCreatedCaseId(created.id);
      setCaseData(created);
      router.push("/admin/cases");
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to create case in database.",
      };
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
        <Link
          href="/admin/cases"
          className="hover:text-neutral-700 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          <span>Cases</span>
        </Link>
        <ChevronRight size={13} className="text-neutral-300" />
        <span className="text-neutral-700 font-semibold">
          {createdCaseId
            ? `Edit Case #${caseData?.caseNumber || ""}`
            : "Create New Case"}
        </span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          {createdCaseId
            ? `Edit Case: ${caseData?.title || "Loading..."}`
            : "Create New Case"}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          {createdCaseId
            ? "Update case details, story, crime scenes, suspects lineup, and solution key"
            : "Set up the basic information and mystery narrative for your detective case (saved on final step)"}
        </p>
      </div>

      {/* Step Pills Navigation */}
      <CaseWizardStepper
        currentStep={currentStep}
        maxStepAllowed={createdCaseId ? 6 : Math.max(currentStep, 1)}
        onStepClick={handleStepClick}
      />

      {/* Step Views */}
      <div className="pt-2">
        {currentStep === 1 && (
          <Step1BasicInfo
            initialData={
              caseData
                ? {
                    caseNumber: caseData.caseNumber,
                    title: caseData.title,
                    description: caseData.description,
                    priceInRupees:
                      caseData.priceInRupees ??
                      (caseData.priceInPaise
                        ? caseData.priceInPaise / 100
                        : 0),
                    coverImageUrl: caseData.coverImageUrl,
                  }
                : draftStep1 || undefined
            }
            isEditing={Boolean(createdCaseId)}
            onSubmit={handleStep1Submit}
            onCancel={() => router.push("/admin/cases")}
            onUploadCover={handleUploadCover}
          />
        )}

        {currentStep === 2 && (
          <Step2StoryDetails
            initialVictim={
              victimData ||
              (draftVictim
                ? {
                    ...draftVictim,
                    dateOfDeath: draftVictim.dateOfDeath,
                  }
                : null)
            }
            initialPoliceReport={policeReportData || draftPoliceReport || null}
            isLoading={isLoadingStep2}
            onBack={() => handleStepClick(1)}
            onSubmit={handleStep2Submit}
          />
        )}

        {currentStep === 3 && (
          <Step3Locations
            caseId={createdCaseId || "draft"}
            onBack={() => handleStepClick(2)}
            onNext={() => handleStepClick(4)}
          />
        )}

        {currentStep === 4 && (
          <Step4Suspects
            caseId={createdCaseId || "draft"}
            onBack={() => handleStepClick(3)}
            onNext={() => handleStepClick(5)}
          />
        )}

        {currentStep === 5 && (
          <Step5CluesEvidence
            caseId={createdCaseId || "draft"}
            onBack={() => handleStepClick(4)}
            onNext={() => handleStepClick(6)}
          />
        )}

        {currentStep === 6 && (
          <Step6ReviewPublish
            caseId={createdCaseId || "draft"}
            draftData={
              !createdCaseId
                ? {
                    caseData: draftStep1,
                    victim: draftVictim,
                    policeReport: draftPoliceReport,
                  }
                : undefined
            }
            onSaveFinalBundle={handleFinalBundleCreation}
            onBack={() => handleStepClick(5)}
            onPublished={() => router.push("/admin/cases")}
          />
        )}
      </div>
    </div>
  );
}
