import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@shared/lib/cn";

const SPINNER_SIZES = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

export interface SpinnerProps extends React.ComponentProps<"svg"> {
  size?: keyof typeof SPINNER_SIZES;
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <Loader2
      data-slot="spinner"
      role="status"
      aria-label="Chargement"
      className={cn(
        "animate-spin text-muted-foreground",
        SPINNER_SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
