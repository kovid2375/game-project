import { apiClient } from "./client";

/* ── Types ── */

export interface AdminCase {
  id: string;
  caseNumber: number;
  title: string;
  description: string;
  coverImageUrl: string;
  priceInPaise: number;
  priceInRupees: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminCasesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCasesResponse {
  data: AdminCase[];
  pagination: AdminCasesPagination;
}

export interface CreateCasePayload {
  caseNumber: number;
  title: string;
  description: string;
  coverImageUrl: string;
  priceInRupees: number;
}

export interface UpdateCasePayload {
  caseNumber?: number;
  title?: string;
  description?: string;
  coverImageUrl?: string;
  priceInRupees?: number;
}

export interface UploadCoverResponse {
  fileId?: string;
  name?: string;
  url: string;
  thumbnailUrl?: string;
}

export interface SetPublishResponse {
  id: string;
  caseNumber: number;
  title: string;
  isPublished: boolean;
  message: string;
}

export interface DeleteCaseResponse {
  message: string;
}

/* ── API Client ── */

export const casesApi = {
  /** GET /admin/cases */
  getCases(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<AdminCasesResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search?.trim()) query.set("search", params.search.trim());

    const qs = query.toString();
    return apiClient<AdminCasesResponse>(`/admin/cases${qs ? `?${qs}` : ""}`);
  },

  /** GET /admin/cases/:id */
  getCase(id: string): Promise<AdminCase> {
    return apiClient<AdminCase>(`/admin/cases/${id}`);
  },

  /** POST /admin/cases/upload-case-cover */
  uploadCover(file: File): Promise<UploadCoverResponse> {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient<UploadCoverResponse>("/admin/cases/upload-case-cover", {
      method: "POST",
      data: formData,
    });
  },

  /** POST /admin/cases */
  createCase(payload: CreateCasePayload): Promise<AdminCase> {
    return apiClient<AdminCase>("/admin/cases", {
      method: "POST",
      data: payload,
    });
  },

  /** PATCH /admin/cases/:id */
  updateCase(id: string, payload: UpdateCasePayload): Promise<AdminCase> {
    return apiClient<AdminCase>(`/admin/cases/${id}`, {
      method: "PATCH",
      data: payload,
    });
  },

  /** PATCH /admin/cases/:id/publish */
  setPublished(id: string, isPublished: boolean): Promise<SetPublishResponse> {
    return apiClient<SetPublishResponse>(`/admin/cases/${id}/publish`, {
      method: "PATCH",
      data: { isPublished },
    });
  },

  /** DELETE /admin/cases/:id */
  deleteCase(id: string): Promise<DeleteCaseResponse> {
    return apiClient<DeleteCaseResponse>(`/admin/cases/${id}`, {
      method: "DELETE",
    });
  },
};
