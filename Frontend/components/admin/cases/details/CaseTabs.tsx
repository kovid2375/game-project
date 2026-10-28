"use client";

export type CaseDetailTab =
  | "overview"
  | "suspects"
  | "locations"
  | "clues"
  | "hints"
  | "solution";

interface CaseTabsProps {
  activeTab: CaseDetailTab;
  onChangeTab: (tab: CaseDetailTab) => void;
  counts?: {
    suspects?: number;
    locations?: number;
    clues?: number;
    hints?: number;
  };
}

const TABS: { id: CaseDetailTab; label: string; countKey?: keyof NonNullable<CaseTabsProps["counts"]> }[] = [
  { id: "overview", label: "Overview" },
  { id: "suspects", label: "Suspects", countKey: "suspects" },
  { id: "locations", label: "Locations", countKey: "locations" },
  { id: "clues", label: "Clues", countKey: "clues" },
  { id: "hints", label: "Hints", countKey: "hints" },
  { id: "solution", label: "Solution" },
];

export default function CaseTabs({
  activeTab,
  onChangeTab,
  counts,
}: CaseTabsProps) {
  return (
    <div className="border-b border-neutral-200 mt-6">
      <nav className="flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.countKey && counts ? counts[tab.countKey] : undefined;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative py-3 px-1 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "text-red-600"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span>{tab.label}</span>
              {typeof count === "number" && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              )}

              {/* Active Bottom Red Underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

