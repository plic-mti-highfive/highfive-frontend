import * as React from "react";

import { cn } from "@shared/lib/cn";

export interface SectionProps extends React.ComponentProps<"section"> {
  title?: string;
  actions?: React.ReactNode;
  /** `lg` : titre de section de premier niveau (Découvrir). `md` (défaut) : sous-titre compact (panneaux latéraux). */
  titleSize?: "md" | "lg";
  /**
   * Petite puce devant le titre, teintee par l'accent du conteneur
   * (`data-accent`). A n'activer que si un ancetre porte un accent : sans
   * `--accent-base`, la puce serait invisible mais prendrait quand meme la place.
   */
  accentMarker?: boolean;
}

function Section({
  title,
  actions,
  titleSize = "md",
  accentMarker = false,
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
        <div className="flex items-center gap-4">
          {title && accentMarker && (
            <span
              aria-hidden="true"
              className="-mr-2 size-2 shrink-0 rounded-pill bg-[var(--accent-base)]"
            />
          )}
          {title && (
            <h2
              className={cn(
                "shrink-0 font-display font-semibold text-foreground",
                titleSize === "lg" ? "text-heading-lg" : "text-heading-md",
              )}
            >
              {title}
            </h2>
          )}
          {title && actions && (
            <span
              aria-hidden="true"
              className="h-px min-w-6 flex-1 bg-border"
            />
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export { Section };
