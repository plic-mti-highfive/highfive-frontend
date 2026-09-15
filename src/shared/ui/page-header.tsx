import * as React from "react";

import { cn } from "@shared/lib/cn";

export interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex items-start justify-between gap-6 border-b border-border pb-6",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-heading-lg font-semibold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-body-md text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export { PageHeader };
