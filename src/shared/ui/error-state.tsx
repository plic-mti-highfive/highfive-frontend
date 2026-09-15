import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@shared/lib/cn";
import { Button } from "./button";

export interface ErrorStateProps extends React.ComponentProps<"div"> {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

function ErrorState({
  message,
  onRetry,
  retryLabel = "Réessayer",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger-fg">
        <AlertTriangle size={22} />
      </span>
      <p className="max-w-sm text-body-md text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
