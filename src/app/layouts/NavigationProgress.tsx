import { useIsFetching } from "@tanstack/react-query";
import { useNavigationPending } from "../navigation-pending";

/**
 * Indicateur de progression global fin, sous l'en-tete (V2, retour util. 5).
 * Visible dans deux cas :
 * - navigation en attente d'un chunk lazy (`useNavigationPending`, deduit de
 *   `useDeferredValue(location)` dans `router.tsx`) ;
 * - requete de page initiale en cours (`useIsFetching`, filtree aux requetes
 *   qui n'ont pas encore de donnees en cache — un refetch en arriere-plan
 *   sur des donnees deja affichees ne doit pas redeclencher la barre).
 *
 * Reste monte en permanence (hauteur fixe `h-0.5`, contenu vide sinon) pour
 * eviter tout saut de mise en page a l'apparition/disparition.
 */
export function NavigationProgress() {
  const navigationPending = useNavigationPending();
  const initialFetchPending =
    useIsFetching({
      predicate: (query) => query.state.data === undefined,
    }) > 0;
  const visible = navigationPending || initialFetchPending;

  return (
    <div
      aria-hidden
      className="sticky top-14 z-sticky h-0.5 w-full overflow-hidden"
    >
      {visible && (
        <div className="nav-progress-bar h-full w-1/3 rounded-full bg-rose" />
      )}
    </div>
  );
}
