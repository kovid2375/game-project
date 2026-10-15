"use client";

import { useState, useEffect } from "react";
import UserFilters from "@/components/admin/UserFilters";
import UsersTable from "@/components/admin/UsersTable";
import { useAdminUsers } from "@/lib/hooks/useAdminUsers";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  // Debounce search typing to avoid rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { users, pagination, isLoading, error, refetch, updateUser, deleteUser } =
    useAdminUsers({
      page,
      limit: 10,
      search: debouncedSearch,
      status,
    });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="p-8">
      <UserFilters
        search={searchTerm}
        onSearchChange={setSearchTerm}
        status={status}
        onStatusChange={handleStatusChange}
        totalCount={pagination?.total ?? users.length}
      />
      <UsersTable
        users={users}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        page={page}
        onPageChange={setPage}
        onUpdateUser={updateUser}
        onDeleteUser={deleteUser}
        onRetry={refetch}
      />
    </div>
  );
}
