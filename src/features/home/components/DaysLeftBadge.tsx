export function DaysLeftBadge({ days }: { days: number | null }) {
  if (days === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M1.5 4L3 5.5L6.5 2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Réussi
      </span>
    );
  }
  if (days <= 2) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200 animate-pulse">
        ⏱ {days}j restants
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full ring-1 ring-orange-200">
        ⏱ {days}j restants
      </span>
    );
  }
  return <span className="text-[10px] text-ink">{days}j restants</span>;
}
