import { useState } from "react";
import { Hand } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { useToggleHighfive } from "@/api/queries/highfives";

export interface HighfiveButtonProps {
  slug: string;
  /** Id du porteur (R-H2 : desactive pour le porteur). */
  ownerId: string;
  count: number;
  /** Etat initial si connu par l'appelant (ex. fiche projet) ; sinon suppose non donne. */
  given?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Reutilisable (fiche projet, `ProjectCard`) : mutation optimiste via
 * `useToggleHighfive` (src/api/queries/highfives.ts), libelles doc 03 §5.
 * `ProjectSummary` ne porte pas l'etat "deja donne" par visiteur (aucune
 * route ne l'expose pour une liste) : sans `given` fourni, le bouton part de
 * "non donne" et se corrige a la premiere reponse serveur (R-H1 idempotent
 * cote handler, donc jamais de double comptage) — voir rapport de mission.
 */
export function HighfiveButton({
  slug,
  ownerId,
  count: initialCount,
  given: initialGiven = false,
  size = "md",
  className,
}: HighfiveButtonProps) {
  const { user, isAuthenticated } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const toggle = useToggleHighfive(slug);

  const [given, setGiven] = useState(initialGiven);
  const [count, setCount] = useState(initialCount);

  // Resynchronise depuis les props sans useEffect (pattern "ajuster l'etat
  // au changement d'une prop" de react.dev/learn/you-might-not-need-an-effect) :
  // un useEffect([initialGiven, initialCount]) declenche le lint
  // react-hooks/set-state-in-effect (rendu en cascade).
  const [prevInitialGiven, setPrevInitialGiven] = useState(initialGiven);
  const [prevInitialCount, setPrevInitialCount] = useState(initialCount);
  if (initialGiven !== prevInitialGiven || initialCount !== prevInitialCount) {
    setPrevInitialGiven(initialGiven);
    setPrevInitialCount(initialCount);
    setGiven(initialGiven);
    setCount(initialCount);
  }

  const isOwner = Boolean(user && user.id === ownerId);

  function handleClick() {
    if (!isAuthenticated) {
      const suite = `${location.pathname}${location.search}`;
      navigate(`/connexion?suite=${encodeURIComponent(suite)}`);
      return;
    }
    if (isOwner || toggle.isPending) return;

    const wasGiven = given;
    const previousCount = count;
    setGiven(!wasGiven);
    setCount(previousCount + (wasGiven ? -1 : 1));

    toggle.mutate(wasGiven, {
      onSuccess: (response) => {
        setGiven(response.given);
        setCount(response.highfiveCount);
      },
      onError: () => {
        setGiven(wasGiven);
        setCount(previousCount);
      },
    });
  }

  const countLabel =
    count === 0 ? "Aucun highfive" : `${count} highfive${count > 1 ? "s" : ""}`;

  return (
    <Button
      type="button"
      variant={given ? "secondary" : "outline"}
      size={size === "sm" ? "sm" : "default"}
      disabled={isOwner}
      title={
        isOwner
          ? "Tu ne peux pas highfiver ton propre projet"
          : given
            ? "Retirer ton highfive"
            : undefined
      }
      aria-pressed={given}
      onClick={handleClick}
      className={cn("gap-1.5", className)}
    >
      <Hand
        size={size === "sm" ? 14 : 16}
        className={cn(given && "fill-current")}
      />
      {size === "md" && <span>{given ? "Highfive donné" : "Highfive"}</span>}
      <span className="tabular-nums">{countLabel}</span>
    </Button>
  );
}
