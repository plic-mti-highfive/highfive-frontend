import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@shared/lib/cn";

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {Icon && (
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={22} />
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-heading-md font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-body-md text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export { EmptyState };
