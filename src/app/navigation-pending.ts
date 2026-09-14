import { createContext, useContext } from "react";

/**
 * Signale qu'une navigation attend le chargement d'un chunk lazy (V2, retour
 * util. 5). `AppRouter` (router.tsx) deduit cet etat via
 * `useDeferredValue(location)` : `<Routes>` est rendu sur la position
 * differee tant que le nouveau chunk n'est pas pret, ce qui conserve le
 * contenu precedent a l'ecran au lieu de retomber sur le fallback Suspense
 * (React garde la derniere UI commitee pendant une mise a jour differee).
 * `NavigationProgress` (src/app/layouts/NavigationProgress.tsx) consomme cet
 * etat pour la barre de progression sous l'en-tete.
 *
 * Module separe (ni dans router.tsx, ni dans layouts/) pour eviter un cycle
 * d'import router.tsx <-> layouts/index.ts <-> NavigationProgress.tsx.
 */
const NavigationPendingContext = createContext(false);

export const NavigationPendingProvider = NavigationPendingContext.Provider;

export function useNavigationPending(): boolean {
  return useContext(NavigationPendingContext);
}
