import * as React from "react";

import { cn } from "@shared/lib/cn";
import { getAccent, type AccentName } from "@shared/lib/accent";

export interface TagPillProps extends Omit<
  React.ComponentProps<"span">,
  "onClick"
> {
  label: string;
  /** Accent explicite ; sinon dérivé de manière déterministe depuis `label`. */
  accent?: AccentName;
  size?: "xs" | "sm";
  onClick?: () => void;
}

function TagPill({
  label,
  accent,
  size = "sm",
  onClick,
  className,
  ...props
}: TagPillProps) {
  const resolvedAccent = accent ?? getAccent(label);

  return (
    <span
      data-slot="tag-pill"
      data-accent={resolvedAccent}
      onClick={
        onClick &&
        ((e: React.MouseEvent) => {
          e.stopPropagation();
          onClick();
        })
      }
      className={cn(
        "inline-flex items-center rounded-pill font-medium tracking-normal whitespace-nowrap transition-opacity bg-[var(--accent-light)] text-[var(--accent-dark)]",
        size === "xs" ? "text-label px-1.5 py-0.5" : "text-body-sm px-2 py-0.5",
        onClick && "cursor-pointer hover:opacity-75",
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}

export { TagPill };
