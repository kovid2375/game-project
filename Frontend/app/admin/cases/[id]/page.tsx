"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { casesApi, CasePreviewData } from "@/lib/api/cases.api";
import CaseHeader from "@/components/admin/cases/details/CaseHeader";
import CaseTabs, { CaseDetailTab } from "@/components/admin/cases/details/CaseTabs";
import OverviewTab from "@/components/admin/cases/details/OverviewTab";
import SuspectsTab from "@/components/admin/cases/details/SuspectsTab";
import LocationsTab from "@/components/admin/cases/details/LocationsTab";
import CluesTab from "@/components/admin/cases/details/CluesTab";
import HintsTab from "@/components/admin/cases/details/HintsTab";
import SolutionTab from "@/components/admin/cases/details/SolutionTab";
import PublishCaseModal from "@/components/admin/cases/PublishCaseModal";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [activeTab, setActiveTab] = useState<CaseDetailTab>("overview");
  const [caseData, setCaseData] = useState<CasePreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const fetchDetails = async () => {
    if (!caseId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await casesApi.getCasePreview(caseId);
      setCaseData(data);
    } catch (err: any) {
      console.error("Failed to load case preview:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load case details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [caseId]);

  const handleTogglePublish = async () => {
    if (!caseData) return;

    // If it's a draft and admin wants to publish, open validation modal
    if (!caseData.isPublished) {
      setIsPublishModalOpen(true);
      return;
    }

    try {
      setIsTogglingPublish(true);
      await casesApi.setPublished(caseData.id, false);
      setCaseData((prev) => (prev ? { ...prev, isPublished: false } : prev));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to unpublish case");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const handleConfirmPublishModal = async (id: string) => {
    try {
      await casesApi.setPublished(id, true);
      setCaseData((prev) => (prev ? { ...prev, isPublished: true } : prev));
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.response?.data?.message || "Failed to publish case",
      };
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-red-600" />
        <p className="text-sm font-medium text-neutral-500">Loading case details…</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center mt-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">Unable to view case</h2>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          {error || "The requested case could not be found."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/cases")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Cases
        </button>
      </div>
    );
  }

  const cluesTotalCount = caseData.locations?.reduce(
    (acc, loc) => acc + (loc.clues?.length || 0),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Top Hero & Meta Bar ── */}
      <CaseHeader
        caseData={caseData}
        onTogglePublish={handleTogglePublish}
        isTogglingPublish={isTogglingPublish}
      />

      {/* ── Tabs Navigation ── */}
      <CaseTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        counts={{
          suspects: caseData.suspects?.length,
          locations: caseData.locations?.length,
          clues: cluesTotalCount,
          hints: caseData.hints?.length,
        }}
      />

      {/* ── Active Tab Panel ── */}
      <div className="animate-in fade-in duration-150">
        {activeTab === "overview" && <OverviewTab caseData={caseData} />}
        {activeTab === "suspects" && (
          <SuspectsTab suspects={caseData.suspects} />
        )}
        {activeTab === "locations" && (
          <LocationsTab locations={caseData.locations} />
        )}
        {activeTab === "clues" && <CluesTab locations={caseData.locations} />}
        {activeTab === "hints" && <HintsTab hints={caseData.hints} />}
        {activeTab === "solution" && (
          <SolutionTab
            solution={caseData.solution}
            suspects={caseData.suspects}
          />
        )}
      </div>

      {/* ── Publish Validation Check Modal ── */}
      <PublishCaseModal
        isOpen={isPublishModalOpen}
        caseItem={caseData}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handleConfirmPublishModal}
      />
    </div>
  );
}

