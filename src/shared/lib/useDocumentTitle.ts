import { useEffect } from "react";

/**
 * R-NAV4 : toute page a un titre de document au format
 * `<Titre de la page> · HighFive!`. Sans titre (page anonyme), on garde le
 * nom du produit seul plutôt qu'un titre vide.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · HighFive!` : "HighFive!";
  }, [title]);
}
