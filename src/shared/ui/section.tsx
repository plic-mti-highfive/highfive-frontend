import * as React from "react";

import { cn } from "@shared/lib/cn";

export interface SectionProps extends React.ComponentProps<"section"> {
  title?: string;
  actions?: React.ReactNode;
}

function Section({
  title,
  actions,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4">
          {title && (
            <h2 className="text-heading-md font-semibold text-foreground">
              {title}
            </h2>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export { Section };
