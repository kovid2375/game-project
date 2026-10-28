"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CaseFilters from "@/components/admin/cases/CaseFilters";
import CasesTable from "@/components/admin/cases/CasesTable";
import CaseModal from "@/components/admin/cases/CaseModal";
import DeleteCaseDialog from "@/components/admin/cases/DeleteCaseDialog";
import { useAdminCases } from "@/lib/hooks/useAdminCases";
import { AdminCase, CreateCasePayload, UpdateCasePayload } from "@/lib/api/cases.api";

export default function AdminCasesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [publishStatus, setPublishStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<AdminCase | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<AdminCase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    cases,
    pagination,
    isLoading,
    error,
    refetch,
    createCase,
    updateCase,
    togglePublish,
    deleteCase,
    uploadCover,
  } = useAdminCases({
    page,
    limit: 10,
    search: debouncedSearch,
    publishStatus,
  });

  const handleOpenCreateModal = () => {
    router.push("/admin/cases/create");
  };

  const handleOpenEditModal = (item: AdminCase) => {
    router.push(`/admin/cases/create?caseId=${item.id}&step=1`);
  };

  const handleViewCase = (item: AdminCase) => {
    router.push(`/admin/cases/${item.id}`);
  };

  const handleSaveCase = async (data: CreateCasePayload | UpdateCasePayload) => {
    if (selectedCase) {
      return await updateCase(selectedCase.id, data);
    } else {
      return await createCase(data as CreateCasePayload);
    }
  };

  const handleOpenDelete = (item: AdminCase) => {
    setCaseToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    const res = await deleteCase(caseToDelete.id);
    setIsDeleting(false);
    if (res.success) {
      setIsDeleteDialogOpen(false);
      setCaseToDelete(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Cases Management
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Create, edit, upload cover images, and publish detective mystery cases.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <CaseFilters
        search={searchTerm}
        onSearchChange={setSearchTerm}
        status={publishStatus}
        onStatusChange={setPublishStatus}
        totalCount={pagination?.total ?? cases.length}
        onNewCase={handleOpenCreateModal}
      />

      {/* Cases List Table */}
      <CasesTable
        cases={cases}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        page={page}
        onPageChange={setPage}
        onViewCase={handleViewCase}
        onEditCase={handleOpenEditModal}
        onDeleteCase={handleOpenDelete}
        onTogglePublish={togglePublish}
        onRetry={refetch}
      />

      {/* Create / Edit Case Modal */}
      <CaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caseItem={selectedCase}
        onSave={handleSaveCase}
        onUploadFile={uploadCover}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCaseDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCaseToDelete(null);
        }}
        caseItem={caseToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
