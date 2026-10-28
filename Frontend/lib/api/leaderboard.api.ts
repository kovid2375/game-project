import { apiClient } from "./client";

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  hintsUsed?: number;
  attemptsUsed?: number;
  completionTimeSeconds?: number;
  completedAt?: string;
  caseId?: string;
  caseTitle?: string;
  // enriched fields for admin view
  userEmail?: string;
  avatarUrl?: string;
  casesCompleted?: number;
}

export interface GlobalLeaderboardResponse {
  totalEntries: number;
  leaderboard: LeaderboardEntry[];
}

export interface CaseLeaderboardResponse {
  case: {
    id: string;
    title: string;
  };
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
}

export const leaderboardApi = {
  /** GET /leaderboard/global */
  getGlobalLeaderboard(): Promise<GlobalLeaderboardResponse> {
    return apiClient<GlobalLeaderboardResponse>("/leaderboard/global");
  },

  /** GET /leaderboard/cases/:caseId */
  getCaseLeaderboard(caseId: string): Promise<CaseLeaderboardResponse> {
    return apiClient<CaseLeaderboardResponse>(`/leaderboard/cases/${caseId}`);
  },
};

