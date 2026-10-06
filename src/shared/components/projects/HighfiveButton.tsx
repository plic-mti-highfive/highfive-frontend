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

  const countLabel = count === 0 ? "Aucun highfive" : `${count}`;

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
      <Hand size={size === "sm" ? 14 : 16}>
        {given && (
          // Les doigts de `Hand` sont des arcs ouverts : `fill` seul laisse le
          // centre vide. On ajoute des silhouettes fermees sous le contour.
          <g fill="currentColor" stroke="none">
            <path d="M6 6a2 2 0 0 1 4 0v10H6z" />
            <path d="M10 4a2 2 0 0 1 4 0v12h-4z" />
            <path d="M14 6a2 2 0 0 1 4 0v10h-4z" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15L6 10H18z" />
          </g>
        )}
      </Hand>
      {size === "md" && <span>{given ? "Highfive donné" : "Highfive"}</span>}
      <span className="tabular-nums">{countLabel}</span>
    </Button>
  );
}
