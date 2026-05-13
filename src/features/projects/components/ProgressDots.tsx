import type { Step } from "../types";
import { MANUAL_STEPS } from "../types";

export function ProgressDots({ step }: { step: Step }) {
  const idx = MANUAL_STEPS.indexOf(step);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-2 mb-8">
      {MANUAL_STEPS.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-400 ${
            i <= idx ? "bg-gray-900 w-8" : "bg-gray-300 w-4"
          }`}
        />
      ))}
      <span className="text-xs text-ink ml-1">
        {idx + 1} / {MANUAL_STEPS.length}
      </span>
    </div>
  );
}
