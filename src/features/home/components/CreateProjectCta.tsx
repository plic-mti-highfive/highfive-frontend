import { useNavigate } from "react-router-dom";

import { Button } from "@shared/ui";

/**
 * Clôture du feed Découvrir (V2, "donner envie de naviguer plutôt que de
 * scroller jusqu'au vide") : relance vers la création plutôt qu'une fin de
 * liste muette.
 */
export function CreateProjectCta() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-[--radius-xl] border border-[--border] bg-card p-8 sm:flex-row sm:items-center">
      <div>
        <h2 className="font-display text-heading-lg font-bold text-foreground">
          Une idée de projet ?
        </h2>
        <p className="mt-1 text-body-md text-muted-foreground">
          Une motivation en acier suffit à elle seule à créer quelque chose de
          grandiose.
        </p>
      </div>
      <Button
        size="lg"
        className="shrink-0"
        onClick={() => navigate("/projets/nouveau")}
      >
        Créer un projet
      </Button>
    </div>
  );
}
