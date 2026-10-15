const activities = [
  {
    id: 1,
    badge: "NEW",
    badgeClass: "bg-red-50 text-red-700 border border-red-200",
    message: "New detective player registered",
    detail: "alex.morgan@email.com",
    time: "2m ago",
  },
  {
    id: 2,
    badge: "SOLVED",
    badgeClass: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    message: "Case #47 solved",
    detail: "The Missing Heir · Detective rank",
    time: "5m ago",
  },
  {
    id: 3,
    badge: "ALERT",
    badgeClass: "bg-red-600 text-white shadow-2xs",
    message: "Failed login attempt",
    detail: "IP: 192.168.1.45 · 3 attempts",
    time: "8m ago",
  },
  {
    id: 4,
    badge: "NEW",
    badgeClass: "bg-red-50 text-red-700 border border-red-200",
    message: "New detective player registered",
    detail: "sarah.chen@email.com",
    time: "12m ago",
  },
  {
    id: 5,
    badge: "GAME",
    badgeClass: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    message: "Case #32 started",
    detail: "The Phantom Signal · 4 detectives",
    time: "15m ago",
  },
  {
    id: 6,
    badge: "SYS",
    badgeClass: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    message: "Database backup complete",
    detail: "Size: 2.4 GB · Duration: 45 s",
    time: "22m ago",
  },
  {
    id: 7,
    badge: "NEW",
    badgeClass: "bg-red-50 text-red-700 border border-red-200",
    message: "New detective player registered",
    detail: "mike.johnson@email.com",
    time: "30m ago",
  },
  {
    id: 8,
    badge: "LIVE",
    badgeClass: "bg-red-50 text-red-700 border border-red-200",
    message: "Case #51 published",
    detail: "Cold Trail · Expert difficulty",
    time: "1h ago",
  },
];

export default function ActivityFeed() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <h3 className="text-sm font-bold text-neutral-900">Recent Game Activity</h3>
        <span className="text-xs text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded">
          {activities.length} events
        </span>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-neutral-100">
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3.5 px-6 py-3.5 hover:bg-neutral-50/80 transition-colors"
          >
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded leading-normal mt-0.5 whitespace-nowrap ${a.badgeClass}`}
            >
              {a.badge}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-900 font-medium">{a.message}</p>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                {a.detail}
              </p>
            </div>

            <span className="text-[11px] text-neutral-400 whitespace-nowrap pt-0.5">
              {a.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
