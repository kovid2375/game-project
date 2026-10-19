"use client";

import { useState, useEffect, useCallback } from "react";
import {
  casesApi,
  AdminCase,
  AdminCasesPagination,
  CreateCasePayload,
  UpdateCasePayload,
} from "../api/cases.api";
import { ApiError } from "../api/client";

interface UseAdminCasesOptions {
  page?: number;
  limit?: number;
  search?: string;
  publishStatus?: "all" | "published" | "draft";
}

interface UseAdminCasesReturn {
  cases: AdminCase[];
  pagination: AdminCasesPagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createCase: (data: CreateCasePayload) => Promise<{ success: boolean; error?: string }>;
  updateCase: (
    id: string,
    data: UpdateCasePayload,
  ) => Promise<{ success: boolean; error?: string }>;
  togglePublish: (id: string, isPublished: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteCase: (id: string) => Promise<{ success: boolean; error?: string }>;
  uploadCover: (file: File) => Promise<{ url?: string; error?: string }>;
}

export function useAdminCases(
  options: UseAdminCasesOptions = {},
): UseAdminCasesReturn {
  const { page = 1, limit = 10, search = "", publishStatus = "all" } = options;

  const [rawCases, setRawCases] = useState<AdminCase[]>([]);
  const [pagination, setPagination] = useState<AdminCasesPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => {
    setRefetchKey((k) => k + 1);
  }, []);

  /* ── Fetch cases whenever page, limit, search or refetchKey change ── */
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    casesApi
      .getCases({ page, limit, search })
      .then((res) => {
        if (cancelled) return;
        setRawCases(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) {
          if (err.statusCode === 401 || err.statusCode === 403) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("casefile_access_token");
              localStorage.removeItem("casefile_admin_user");
              window.location.href = "/admin/login";
              return;
            }
          }
          setError(err.message);
        } else {
          setError("Failed to fetch cases");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, refetchKey]);

  /* ── Filter cases locally by publishStatus if requested ── */
  const cases = rawCases.filter((item) => {
    if (publishStatus === "published") return item.isPublished;
    if (publishStatus === "draft") return !item.isPublished;
    return true;
  });

  /* ── Upload Cover Image ── */
  const uploadCover = useCallback(async (file: File) => {
    try {
      const res = await casesApi.uploadCover(file);
      return { url: res.url };
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to upload cover image";
      return { error: msg };
    }
  }, []);

  /* ── Create Case ── */
  const createCase = useCallback(
    async (data: CreateCasePayload) => {
      try {
        await casesApi.createCase(data);
        refetch();
        return { success: true };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Failed to create case";
        return { success: false, error: msg };
      }
    },
    [refetch],
  );

  /* ── Update Case ── */
  const updateCase = useCallback(
    async (id: string, data: UpdateCasePayload) => {
      try {
        await casesApi.updateCase(id, data);
        refetch();
        return { success: true };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Failed to update case";
        return { success: false, error: msg };
      }
    },
    [refetch],
  );

  /* ── Toggle Publish Status ── */
  const togglePublish = useCallback(
    async (id: string, isPublished: boolean) => {
      try {
        // Optimistic update
        setRawCases((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isPublished } : c)),
        );
        await casesApi.setPublished(id, isPublished);
        return { success: true };
      } catch (err) {
        refetch();
        const msg =
          err instanceof ApiError
            ? err.message
            : "Failed to update case publish status";
        return { success: false, error: msg };
      }
    },
    [refetch],
  );

  /* ── Delete Case ── */
  const deleteCase = useCallback(
    async (id: string) => {
      try {
        await casesApi.deleteCase(id);
        refetch();
        return { success: true };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Failed to delete case";
        return { success: false, error: msg };
      }
    },
    [refetch],
  );

  return {
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
  };
}
