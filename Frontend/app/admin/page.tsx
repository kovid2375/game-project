import type { Metadata } from "next";
import StatCard from "@/components/admin/StatCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import { Zap, Activity, Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Admin | CASEFILE",
};

/* ── Mock stat data ── */
const stats = [
  {
    label: "Total Players",
    value: "2,847",
    change: 12.5,
    sparklineData: [30, 35, 32, 40, 38, 45, 42, 50, 48, 55, 60, 58, 65],
  },
  {
    label: "Active Today",
    value: "384",
    change: 8.3,
    sparklineData: [20, 22, 18, 25, 30, 28, 35, 32, 38, 40, 42, 38, 45],
  },
  {
    label: "New Signups (7d)",
    value: "127",
    change: -2.1,
    sparklineData: [50, 48, 45, 42, 40, 38, 42, 39, 35, 38, 36, 34, 37],
  },
  {
    label: "Cases Solved",
    value: "1,205",
    change: 15.7,
    sparklineData: [10, 15, 12, 20, 18, 25, 30, 28, 35, 40, 38, 45, 50],
  },
];

/* ── Highlight rows ── */
const highlights = [
  { label: "New Signups Today", value: "23" },
  { label: "Cases Started", value: "47" },
  { label: "Avg Session", value: "18m 42s" },
  { label: "Peak Concurrent", value: "312" },
  { label: "Investigation Rate", value: "94.2%" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Bottom Grid: Feed + Quick Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Activity Feed (2 cols) */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Right — Quick Stats Column */}
        <div className="space-y-5">
          {/* Daily Active Users */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider">
                Daily Active Players
              </span>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                62.8%
              </span>
            </div>

            <p className="text-[38px] font-bold text-neutral-900 font-mono leading-tight tracking-tight mt-1">
              1,789
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              out of 2,847 registered players
            </p>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                style={{ width: "62.8%" }}
              />
            </div>
          </div>

          {/* Today's Highlights */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <Activity size={14} />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">
                Today&apos;s Highlights
              </h3>
            </div>

            <div className="space-y-3">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center justify-between text-xs py-1 border-b border-neutral-50 last:border-none"
                >
                  <span className="text-neutral-500">{h.label}</span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Server Status */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <Zap size={14} />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">
                System Status
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { name: "API Server", status: "Operational", ok: true },
                { name: "Database", status: "Operational", ok: true },
                { name: "WebSocket", status: "Operational", ok: true },
                { name: "Game Engine", status: "Operational", ok: true },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{s.name}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      s.ok
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        s.ok ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
