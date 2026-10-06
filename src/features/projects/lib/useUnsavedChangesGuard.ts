import { useEffect } from "react";

/**
 * Avertit le navigateur avant de fermer l'onglet ou de recharger la page tant
 * que des changements ne sont pas enregistres. `useBlocker` de react-router
 * n'est pas utilisable ici (l'app utilise `<BrowserRouter>`, pas un data
 * router) : la navigation interne est donc gardee a la main par l'editeur
 * (lien retour, bouton Annuler). Le bouton retour du navigateur n'est pas couvert.
 */
export function useUnsavedChangesGuard(dirty: boolean): void {
  useEffect(() => {
    if (!dirty) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);
}
