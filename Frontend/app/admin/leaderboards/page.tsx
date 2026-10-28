"use client";

import { useEffect, useState } from "react";
import { casesApi, AdminCase } from "@/lib/api/cases.api";
import {
  leaderboardApi,
  LeaderboardEntry,
} from "@/lib/api/leaderboard.api";
import LeaderboardHero from "@/components/admin/leaderboard/LeaderboardHero";
import LeaderboardStats from "@/components/admin/leaderboard/LeaderboardStats";
import LeaderboardTable from "@/components/admin/leaderboard/LeaderboardTable";
import {
  Trophy,
  FolderOpen,
  Zap,
  CheckCheck,
  ChevronDown,
} from "lucide-react";

type LeaderboardTab = "overall" | "by_case" | "fastest" | "most_completed";

export default function AdminLeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("overall");
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("all");

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats calculation
  const totalPlayers = leaderboard.length;
  const completedPlayers = leaderboard.length;
  const topScore = leaderboard[0]?.score || 0;
  const topScorerName = leaderboard[0]?.playerName || "";

  // Fastest solver
  const sortedByTime = [...leaderboard].sort((a, b) => {
    return (a.completionTimeSeconds || 999999) - (b.completionTimeSeconds || 999999);
  });
  const fastestSolver = sortedByTime[0];
  const fastestTimeFormatted = fastestSolver?.completionTimeSeconds
    ? `${Math.floor(fastestSolver.completionTimeSeconds / 60)}m ${
        fastestSolver.completionTimeSeconds % 60
      }s`
    : "—";

  // Load Cases for filter dropdown
  useEffect(() => {
    casesApi
      .getCases({ limit: 100 })
      .then((res) => setCases(res.data || []))
      .catch((err) => console.error("Failed to load cases:", err));
  }, []);

  // Fetch Leaderboard data based on selection
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        if (selectedCaseId === "all") {
          const res = await leaderboardApi.getGlobalLeaderboard();
          setLeaderboard(res.leaderboard || []);
        } else {
          const res = await leaderboardApi.getCaseLeaderboard(selectedCaseId);
          setLeaderboard(res.leaderboard || []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedCaseId]);

  // Tab Filtering & Sorting
  let displayedEntries = [...leaderboard];
  if (activeTab === "fastest") {
    displayedEntries.sort(
      (a, b) =>
        (a.completionTimeSeconds || 999999) -
        (b.completionTimeSeconds || 999999)
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Hero Banner ── */}
      <LeaderboardHero />

      {/* ── 4 Key Metric Stat Cards ── */}
      <LeaderboardStats
        totalPlayers={totalPlayers}
        completedPlayers={completedPlayers}
        topScore={topScore}
        topScorerName={topScorerName}
        fastestTime={fastestTimeFormatted}
        fastestSolverName={fastestSolver?.playerName || ""}
      />

      {/* ── Sub Navigation Tabs & Case Dropdown Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pt-3">
        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("overall")}
            className={`flex items-center gap-1.5 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
              activeTab === "overall"
                ? "text-red-600"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Trophy size={15} />
            <span>Overall Leaderboard</span>
            {activeTab === "overall" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("by_case");
              if (selectedCaseId === "all" && cases.length > 0) {
                setSelectedCaseId(cases[0].id);
              }
            }}
            className={`flex items-center gap-1.5 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
              activeTab === "by_case"
                ? "text-red-600"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <FolderOpen size={15} />
            <span>By Case</span>
            {activeTab === "by_case" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fastest")}
            className={`flex items-center gap-1.5 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
              activeTab === "fastest"
                ? "text-red-600"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Zap size={15} />
            <span>Fastest Solvers</span>
            {activeTab === "fastest" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-t-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("most_completed")}
            className={`flex items-center gap-1.5 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
              activeTab === "most_completed"
                ? "text-red-600"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <CheckCheck size={15} />
            <span>Most Cases Completed</span>
            {activeTab === "most_completed" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Case Filter Selector */}
        <div className="pb-2 sm:pb-0">
          <div className="relative inline-block text-left">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-neutral-800 shadow-2xs hover:border-neutral-300 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">All Cases (Global)</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  Case #{c.caseNumber}: {c.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── Leaderboard Table ── */}
      <LeaderboardTable
        entries={displayedEntries}
        isLoading={isLoading}
        selectedCaseId={selectedCaseId}
      />
    </div>
  );
}

