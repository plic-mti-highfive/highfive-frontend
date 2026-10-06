import type { ComponentProps } from "react";

import { cn } from "@shared/lib/cn";

/**
 * Bloc de la fiche : fond carte, bordure et padding propres, pour que chaque
 * section (a propos, besoins, commentaires, equipe...) se lise comme une unite
 * separee du fond de page. Sous un theme de projet, `--card` et `--border`
 * viennent de sa palette.
 */
export function ProjectPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="project-panel"
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-rest",
        className,
      )}
      {...props}
    />
  );
}
