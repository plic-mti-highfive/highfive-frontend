import type { Project } from "@shared/types";
import type { Direction } from "../hooks/useCarousel";

interface AnimatedCardProps {
  project: Project;
  animating: boolean;
  direction: Direction;
}

export function AnimatedCard({
  project,
  animating,
  direction,
}: AnimatedCardProps) {
  const exitX = direction === "right" ? "-translate-x-6" : "translate-x-6";

  return (
    <div
      className={`
        bg-white rounded-2xl p-7 shadow-sm w-full flex flex-col justify-start
        transition-all duration-300 ease-in-out
        ${
          animating
            ? `opacity-0 ${exitX} scale-[0.97]`
            : `opacity-100 translate-x-0 scale-100`
        }
      `}
      style={{ minHeight: "9rem" }}
    >
      <h3 className="font-bold text-xl mb-3 text-ink">{project.name}</h3>
      <p className="text-sm text-ink leading-relaxed">{project.description}</p>
    </div>
  );
}
