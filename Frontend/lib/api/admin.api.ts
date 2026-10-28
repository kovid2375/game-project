import { apiClient } from "./client";

/* ── Types ── */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUser {
  lastLogin?: string | null;
  sessions?: {
    id: string;
    createdAt: string;
    lastUsedAt?: string | null;
    expiresAt: string;
  }[];
  playerCases?: {
    id: string;
    gameCaseId: string;
    status: string;
    currentPhase: number;
    actionPoints: number;
    score: number;
    hintsUsed: number;
    attemptsUsed: number;
    startedAt: string;
    completedAt?: string | null;
    lastActivityAt: string;
    gameCase?: {
      id: string;
      caseNumber: number;
      title: string;
      priceInPaise: number;
      coverImageUrl: string;
    };
    discoveries?: any[];
    attempts?: any[];
  }[];
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  pagination: AdminPagination;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  updatedAt: string;
}

export interface DeleteUserResponse {
  message: string;
}

/* ── API Functions ── */

export const adminApi = {
  /** POST /admin/auth/login */
  login(payload: AdminLoginPayload): Promise<AdminLoginResponse> {
    return apiClient<AdminLoginResponse>("/admin/auth/login", {
      method: "POST",
      data: payload,
      credentials: "include",
    });
  },

  /** GET /admin/users */
  getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<AdminUsersResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search?.trim()) query.set("search", params.search.trim());
    if (params.status && params.status !== "all")
      query.set("status", params.status);

    const qs = query.toString();
    return apiClient<AdminUsersResponse>(
      `/admin/users${qs ? `?${qs}` : ""}`,
    );
  },

  /** GET /admin/users/:id */
  getUser(id: string): Promise<AdminUserDetail> {
    return apiClient<AdminUserDetail>(`/admin/users/${id}`);
  },

  /** PATCH /admin/users/:id */
  updateUser(
    id: string,
    payload: UpdateUserPayload,
  ): Promise<UpdateUserResponse> {
    return apiClient<UpdateUserResponse>(`/admin/users/${id}`, {
      method: "PATCH",
      data: payload,
    });
  },

  /** DELETE /admin/users/:id */
  deleteUser(id: string): Promise<DeleteUserResponse> {
    return apiClient<DeleteUserResponse>(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },
};
