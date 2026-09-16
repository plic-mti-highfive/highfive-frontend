import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@shared/lib/cn";
import { getAccent, type AccentName } from "@shared/lib/accent";
import { badgeVariants } from "./badge-variants";

export interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  /** Requis uniquement pour tone="accent" ; déterministe si non fourni via `id`. */
  accent?: AccentName;
  /** Id à hacher pour dériver l'accent quand tone="accent" et `accent` n'est pas fourni. */
  id?: string;
}

function Badge({
  className,
  tone = "neutral",
  accent,
  id,
  ...props
}: BadgeProps) {
  const resolvedAccent =
    tone === "accent"
      ? (accent ?? (id ? getAccent(id) : undefined))
      : undefined;
  return (
    <span
      data-slot="badge"
      data-accent={resolvedAccent}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}

export { Badge };
