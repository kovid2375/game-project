interface StatCardProps {
  label: string;
  value: string;
  change: number;
  sparklineData: number[];
}

export default function StatCard({
  label,
  value,
  change,
  sparklineData,
}: StatCardProps) {
  const isPositive = change >= 0;
  const gradientId = `sparkline-grad-${label.replace(/\s+/g, "-").toLowerCase()}`;

  // ── Build SVG sparkline ──
  const W = 120;
  const H = 40;
  const max = Math.max(...sparklineData);
  const min = Math.min(...sparklineData);
  const range = max - min || 1;

  const points = sparklineData
    .map((d, i) => {
      const x = (i / (sparklineData.length - 1)) * W;
      const y = H - ((d - min) / range) * (H - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,${H} ${points} ${W},${H}`;

  const strokeColor = "#dc2626"; // Crimson red accent

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-red-300 transition-all duration-300 group hover:shadow-md hover:shadow-red-500/5 shadow-2xs">
      <p className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">
        {label}
      </p>

      <div className="flex items-end justify-between gap-4">
        {/* Value + change */}
        <div className="min-w-0">
          <p className="text-[32px] font-bold text-neutral-900 tracking-tight leading-none font-mono">
            {value}
          </p>
          <div
            className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
              isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            <span>{isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(change)}%</span>
            <span className="text-neutral-400 font-normal text-[10px]">vs last wk</span>
          </div>
        </div>

        {/* Sparkline */}
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon fill={`url(#${gradientId})`} points={fillPoints} />
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
}
