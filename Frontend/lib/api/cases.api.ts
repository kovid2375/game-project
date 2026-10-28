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

  /** POST /admin/cases/bundle */
  createCaseBundle(payload: any): Promise<AdminCase> {
    return apiClient<AdminCase>("/admin/cases/bundle", {
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

  /** GET /admin/cases/:caseId/victim */
  getVictim(caseId: string): Promise<CaseVictim | null> {
    return apiClient<CaseVictim | null>(`/admin/cases/${caseId}/victim`);
  },

  /** PUT /admin/cases/:caseId/victim */
  upsertVictim(
    caseId: string,
    payload: UpsertVictimPayload
  ): Promise<CaseVictim> {
    return apiClient<CaseVictim>(`/admin/cases/${caseId}/victim`, {
      method: "PUT",
      data: payload,
    });
  },

  /** GET /admin/cases/:caseId/police-report */
  getPoliceReport(caseId: string): Promise<PoliceReport | null> {
    return apiClient<PoliceReport | null>(
      `/admin/cases/${caseId}/police-report`
    );
  },

  /** PUT /admin/cases/:caseId/police-report */
  upsertPoliceReport(
    caseId: string,
    payload: UpsertPoliceReportPayload
  ): Promise<PoliceReport> {
    return apiClient<PoliceReport>(`/admin/cases/${caseId}/police-report`, {
      method: "PUT",
      data: payload,
    });
  },

  /* ── Locations Endpoints ── */

  /** GET /admin/cases/:caseId/locations */
  getLocations(caseId: string): Promise<CaseLocation[]> {
    return apiClient<CaseLocation[]>(`/admin/cases/${caseId}/locations`);
  },

  /** POST /admin/cases/:caseId/locations */
  createLocation(
    caseId: string,
    payload: CreateLocationPayload
  ): Promise<CaseLocation> {
    return apiClient<CaseLocation>(`/admin/cases/${caseId}/locations`, {
      method: "POST",
      data: payload,
    });
  },

  /** PATCH /admin/cases/:caseId/locations/:locationId */
  updateLocation(
    caseId: string,
    locationId: string,
    payload: UpdateLocationPayload
  ): Promise<CaseLocation> {
    return apiClient<CaseLocation>(
      `/admin/cases/${caseId}/locations/${locationId}`,
      {
        method: "PATCH",
        data: payload,
      }
    );
  },

  /** DELETE /admin/cases/:caseId/locations/:locationId */
  deleteLocation(
    caseId: string,
    locationId: string
  ): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
      `/admin/cases/${caseId}/locations/${locationId}`,
      {
        method: "DELETE",
      }
    );
  },

  /* ── Clues Endpoints ── */

  /** GET /admin/cases/:caseId/locations/:locationId/clues */
  getClues(caseId: string, locationId: string): Promise<LocationClue[]> {
    return apiClient<LocationClue[]>(
      `/admin/cases/${caseId}/locations/${locationId}/clues`
    );
  },

  /** POST /admin/cases/:caseId/locations/:locationId/clues */
  createClue(
    caseId: string,
    locationId: string,
    payload: CreateCluePayload
  ): Promise<LocationClue> {
    return apiClient<LocationClue>(
      `/admin/cases/${caseId}/locations/${locationId}/clues`,
      {
        method: "POST",
        data: payload,
      }
    );
  },

  /** PATCH /admin/cases/:caseId/locations/:locationId/clues/:clueId */
  updateClue(
    caseId: string,
    locationId: string,
    clueId: string,
    payload: Partial<CreateCluePayload>
  ): Promise<LocationClue> {
    return apiClient<LocationClue>(
      `/admin/cases/${caseId}/locations/${locationId}/clues/${clueId}`,
      {
        method: "PATCH",
        data: payload,
      }
    );
  },

  /** DELETE /admin/cases/:caseId/locations/:locationId/clues/:clueId */
  deleteClue(
    caseId: string,
    locationId: string,
    clueId: string
  ): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
      `/admin/cases/${caseId}/locations/${locationId}/clues/${clueId}`,
      {
        method: "DELETE",
      }
    );
  },

  /* ── Documents Endpoints ── */

  /** GET /admin/cases/:caseId/locations/:locationId/documents */
  getDocuments(
    caseId: string,
    locationId: string
  ): Promise<LocationDocument[]> {
    return apiClient<LocationDocument[]>(
      `/admin/cases/${caseId}/locations/${locationId}/documents`
    );
  },

  /** POST /admin/cases/:caseId/locations/:locationId/documents */
  createDocument(
    caseId: string,
    locationId: string,
    payload: CreateDocumentPayload
  ): Promise<LocationDocument> {
    return apiClient<LocationDocument>(
      `/admin/cases/${caseId}/locations/${locationId}/documents`,
      {
        method: "POST",
        data: payload,
      }
    );
  },

  /** DELETE /admin/cases/:caseId/locations/:locationId/documents/:documentId */
  deleteDocument(
    caseId: string,
    locationId: string,
    documentId: string
  ): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
      `/admin/cases/${caseId}/locations/${locationId}/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );
  },

  /* ── Suspects Endpoints ── */

  /** GET /admin/cases/:caseId/suspects */
  getSuspects(caseId: string): Promise<GetSuspectsResponse> {
    return apiClient<GetSuspectsResponse>(`/admin/cases/${caseId}/suspects`);
  },

  /** POST /admin/cases/:caseId/suspects */
  createSuspect(
    caseId: string,
    payload: CreateSuspectPayload
  ): Promise<CreateSuspectResponse> {
    return apiClient<CreateSuspectResponse>(`/admin/cases/${caseId}/suspects`, {
      method: "POST",
      data: payload,
    });
  },

  /** PATCH /admin/cases/suspects/:suspectId */
  updateSuspect(
    suspectId: string,
    payload: UpdateSuspectPayload
  ): Promise<{ message: string; suspect: CaseSuspect }> {
    return apiClient<{ message: string; suspect: CaseSuspect }>(
      `/admin/cases/suspects/${suspectId}`,
      {
        method: "PATCH",
        data: payload,
      }
    );
  },

  /** DELETE /admin/cases/suspects/:suspectId */
  deleteSuspect(suspectId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
      `/admin/cases/suspects/${suspectId}`,
      {
        method: "DELETE",
      }
    );
  },

  /* ── Suspect Interrogation Threads & Responses ── */

  /** GET /admin/cases/suspects/:suspectId/interview-threads */
  getInterviewThreads(
    suspectId: string
  ): Promise<{ threads: InterviewThread[] }> {
    return apiClient<{ threads: InterviewThread[] }>(
      `/admin/cases/suspects/${suspectId}/interview-threads`
    );
  },

  /** POST /admin/cases/suspects/:suspectId/interview-threads */
  createInterviewThread(
    suspectId: string,
    payload: CreateInterviewThreadPayload
  ): Promise<{ message?: string; thread: InterviewThread }> {
    return apiClient<{ message?: string; thread: InterviewThread }>(
      `/admin/cases/suspects/${suspectId}/interview-threads`,
      {
        method: "POST",
        data: payload,
      }
    );
  },

  /** POST /admin/cases/interview-threads/:threadId/responses */
  createInterviewResponse(
    threadId: string,
    payload: CreateInterviewResponsePayload
  ): Promise<InterviewResponse> {
    return apiClient<InterviewResponse>(
      `/admin/cases/interview-threads/${threadId}/responses`,
      {
        method: "POST",
        data: payload,
      }
    );
  },

  /** DELETE /admin/cases/interview-threads/:threadId */
  deleteInterviewThread(threadId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
      `/admin/cases/interview-threads/${threadId}`,
      {
        method: "DELETE",
      }
    );
  },

  /* ── Solution Endpoints ── */

  /** GET /admin/cases/:caseId/solution */
  getSolution(caseId: string): Promise<CaseSolution | null> {
    return apiClient<CaseSolution | null>(`/admin/cases/${caseId}/solution`);
  },

  /** PUT /admin/cases/:caseId/solution */
  upsertSolution(
    caseId: string,
    payload: UpsertSolutionPayload
  ): Promise<CaseSolution> {
    return apiClient<CaseSolution>(`/admin/cases/${caseId}/solution`, {
      method: "PUT",
      data: payload,
    });
  },

  /* ── Validation & Preview Endpoints ── */

  /** GET /admin/cases/:caseId/validate */
  validateCase(caseId: string): Promise<CaseValidationResponse> {
    return apiClient<CaseValidationResponse>(
      `/admin/cases/${caseId}/validate`
    );
  },

  /** GET /admin/cases/:caseId/preview */
  getCasePreview(caseId: string): Promise<CasePreviewData> {
    return apiClient<CasePreviewData>(`/admin/cases/${caseId}/preview`);
  },
};

/* ── Step 2 Types ── */

export interface CaseVictim {
  id?: string;
  gameCaseId?: string;
  name: string;
  age: number;
  occupation: string;
  dateOfDeath: string;
  placeOfDeath: string;
  biography?: string;
}

export interface UpsertVictimPayload {
  name: string;
  age: number;
  occupation: string;
  dateOfDeath: string;
  placeOfDeath: string;
  biography?: string;
}

export interface PoliceReport {
  id?: string;
  gameCaseId?: string;
  timeOfDeathStart?: string;
  timeOfDeathEnd?: string;
  causeOfDeath: string;
  officerNotes: string;
  isPublished?: boolean;
}

export interface UpsertPoliceReportPayload {
  timeOfDeathStart?: string;
  timeOfDeathEnd?: string;
  causeOfDeath: string;
  officerNotes: string;
  isPublished?: boolean;
}

/* ── Step 3 Location, Clue & Document Types ── */

export interface CaseLocation {
  id: string;
  gameCaseId: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  mapX?: number | null;
  mapY?: number | null;
  isInitiallyOpen: boolean;
  isDeadEnd?: boolean;
  searchActionPointCost?: number;
  sortOrder?: number;
  createdAt?: string;
  clues?: LocationClue[];
  documents?: LocationDocument[];
  _count?: {
    clues?: number;
    documents?: number;
  };
}

export interface CreateLocationPayload {
  name: string;
  description: string;
  imageUrl?: string;
  mapX?: number;
  mapY?: number;
  isInitiallyOpen?: boolean;
  isDeadEnd?: boolean;
  searchActionPointCost?: number;
  sortOrder?: number;
}

export interface UpdateLocationPayload {
  name?: string;
  description?: string;
  imageUrl?: string;
  mapX?: number;
  mapY?: number;
  isInitiallyOpen?: boolean;
  isDeadEnd?: boolean;
  searchActionPointCost?: number;
  sortOrder?: number;
}

export interface LocationClue {
  id: string;
  caseLocationId: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  sortOrder?: number;
  createdAt?: string;
}

export interface CreateCluePayload {
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  sortOrder?: number;
}

export interface LocationDocument {
  id: string;
  caseLocationId: string;
  title: string;
  description: string;
  content?: string;
  fileUrl?: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface CreateDocumentPayload {
  title: string;
  description: string;
  content?: string;
  fileUrl?: string;
  sortOrder?: number;
}

/* ── Step 4 Suspect & Interrogation Types ── */

export interface CaseSuspect {
  id: string;
  gameCaseId: string;
  name: string;
  photoUrl?: string | null;
  relationship: string;
  description: string;
  claimedAlibi: string;
  connections?: string;
  sortOrder?: number;
  isInitiallyUnlocked: boolean;
  createdAt?: string;
  threads?: InterviewThread[];
}

export interface GetSuspectsResponse {
  caseId: string;
  caseTitle: string;
  total: number;
  suspects: CaseSuspect[];
}

export interface CreateSuspectPayload {
  name: string;
  photoUrl?: string;
  relationship: string;
  description: string;
  claimedAlibi: string;
  connections?: string;
  sortOrder?: number;
  isInitiallyUnlocked?: boolean;
}

export interface CreateSuspectResponse {
  message: string;
  caseTitle: string;
  suspect: CaseSuspect;
}

export interface UpdateSuspectPayload {
  name?: string;
  photoUrl?: string;
  relationship?: string;
  description?: string;
  claimedAlibi?: string;
  connections?: string;
  sortOrder?: number;
  isInitiallyUnlocked?: boolean;
}

export interface InterviewThread {
  id: string;
  suspectId: string;
  topic: string;
  question: string;
  visitNumber: number;
  isInitiallyAvailable: boolean;
  sortOrder?: number;
  responses?: InterviewResponse[];
}

export interface CreateInterviewThreadPayload {
  topic: string;
  question: string;
  visitNumber?: number;
  isInitiallyAvailable?: boolean;
  sortOrder?: number;
}

export interface InterviewResponse {
  id: string;
  threadId: string;
  responseText: string;
  isNervous?: boolean;
  sortOrder?: number;
  internalNotes?: string;
}

export interface CreateInterviewResponsePayload {
  responseText: string;
  isNervous?: boolean;
  sortOrder?: number;
  internalNotes?: string;
}

/* ── Step 5 Solution Types ── */

export interface CaseSolution {
  id: string;
  gameCaseId: string;
  correctSuspectId: string;
  motive: string;
  method: string;
  explanation: string;
  epilogue: string;
  motiveKeywords?: string[];
  methodKeywords?: string[];
}

export interface UpsertSolutionPayload {
  correctSuspectId: string;
  motive: string;
  method: string;
  explanation: string;
  epilogue: string;
  motiveKeywords?: string[];
  methodKeywords?: string[];
}

/* ── Step 6 Validation Types ── */

export interface CaseValidationResponse {
  caseId: string;
  caseNumber: number;
  title: string;
  readyToPublish: boolean;
  errors: string[];
  warnings: string[];
}

export interface CaseHint {
  id?: string;
  gameCaseId?: string;
  hintNumber: number;
  content: string;
  scorePenalty?: number;
  hintText?: string;
  penaltySeconds?: number;
}

/* ── Preview Aggregated Type ── */
export interface CasePreviewData extends AdminCase {
  victim?: CaseVictim | null;
  policeReport?: PoliceReport | null;
  statements?: any[];
  suspects: (CaseSuspect & {
    threads?: (InterviewThread & {
      responses?: (InterviewResponse & {
        unlocks?: any[];
      })[];
    })[];
  })[];
  locations: (CaseLocation & {
    clues?: LocationClue[];
    documents?: LocationDocument[];
    leadsFrom?: any[];
  })[];
  hints: CaseHint[];
  solution?: CaseSolution | null;
}




