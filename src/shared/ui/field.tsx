import * as React from "react";

import { cn } from "@shared/lib/cn";
import { Label } from "./label";

export interface FieldProps extends React.ComponentProps<"div"> {
  label?: string;
  htmlFor?: string;
  description?: string;
  /** Message d'erreur ; remplace `description` quand présent. */
  error?: string;
  required?: boolean;
}

function Field({
  label,
  htmlFor,
  description,
  error,
  required,
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-danger-fg">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-body-sm text-danger-fg" role="alert">
          {error}
        </p>
      ) : description ? (
        <p className="text-body-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { Field };
