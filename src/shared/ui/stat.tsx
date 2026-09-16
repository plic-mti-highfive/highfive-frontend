import * as React from "react";

import { cn } from "@shared/lib/cn";

export interface StatProps extends React.ComponentProps<"div"> {
  value: React.ReactNode;
  label: string;
}

function Stat({ value, label, className, ...props }: StatProps) {
  return (
    <div
      data-slot="stat"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    >
      <span className="text-heading-lg font-semibold text-foreground tabular-nums">
        {value}
      </span>
      <span className="text-body-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export { Stat };
