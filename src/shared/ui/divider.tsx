import { cn } from "@shared/lib/cn";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  orientation?: DividerOrientation;
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  className,
}: DividerProps) {
  return (
    <hr
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "border-border shrink-0",
        orientation === "horizontal" ? "w-full border-t" : "h-full border-l",
        className,
      )}
    />
  );
}
