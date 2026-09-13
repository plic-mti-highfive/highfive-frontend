import * as React from "react";

import { cn } from "@shared/lib/cn";

export interface ListItemProps extends React.ComponentProps<"button"> {
  /** Avatar/icone a gauche de la ligne. */
  leading?: React.ReactNode;
  /** Contenu court a droite (horodatage, badge...). */
  trailing?: React.ReactNode;
  /** Ligne actuellement selectionnee (conversation ouverte...). */
  active?: boolean;
  /** Fait ressortir la ligne (non lue) via un pastille + un fond teinte. */
  unread?: boolean;
}

/**
 * Ligne de liste cliquable (conversations, notifications...) : avatar,
 * contenu, meta a droite et pastille "non lu". `type="button"` par defaut —
 * l'appelant navigue via `onClick` (useNavigate) plutot qu'un `<a>`, pour
 * rester composable avec la selection d'etat (R-R3 : la route porte l'etat).
 */
function ListItem({
  leading,
  trailing,
  active,
  unread,
  className,
  children,
  ...props
}: ListItemProps) {
  return (
    <button
      type="button"
      data-slot="list-item"
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-fast outline-none cursor-pointer hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
        active && "bg-muted",
        unread && !active && "bg-primary/5",
        className,
      )}
      {...props}
    >
      {leading}
      <span className="min-w-0 flex-1">{children}</span>
      {trailing}
      {unread && (
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-primary"
        />
      )}
    </button>
  );
}

export { ListItem };
