"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminApi,
  AdminUser,
  AdminPagination,
} from "../api/admin.api";
import { ApiError } from "../api/client";

interface UseAdminUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  pagination: AdminPagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  updateUser: (
    id: string,
    data: { name?: string; email?: string; isActive?: boolean },
  ) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
}

export function useAdminUsers(
  options: UseAdminUsersOptions = {},
): UseAdminUsersReturn {
  const { page = 1, limit = 10, search = "", status = "all" } = options;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => {
    setRefetchKey((k) => k + 1);
  }, []);

  /* ── Fetch users whenever params or refetchKey change ── */
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    adminApi
      .getUsers({ page, limit, search, status })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data);
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
          setError("Failed to fetch users");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, status, refetchKey]);

  /* ── Update a user ── */
  const updateUser = useCallback(
    async (
      id: string,
      data: { name?: string; email?: string; isActive?: boolean },
    ): Promise<boolean> => {
      try {
        await adminApi.updateUser(id, data);
        refetch();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to update user");
        }
        return false;
      }
    },
    [refetch],
  );

  /* ── Delete a user ── */
  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await adminApi.deleteUser(id);
        refetch();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to delete user");
        }
        return false;
      }
    },
    [refetch],
  );

  return { users, pagination, isLoading, error, refetch, updateUser, deleteUser };
}
