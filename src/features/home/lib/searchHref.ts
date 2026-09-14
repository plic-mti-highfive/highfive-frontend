import type { SearchParams, SearchSort } from "@/domain";

/**
 * Traduit un `SearchParams` (domaine, anglais) en URL `/recherche` (francais,
 * doc 06/R-R4). Miroir cote lecture de `SearchPage.tsx` (`TYPE_TO_DOMAIN`,
 * `SORT_TO_DOMAIN`), duplique ici plutot qu'importe : `SearchPage.tsx` est
 * hors perimetre de ce lot (lecture seule, proprietaire = agent recherche).
 */
const SORT_TO_URL: Partial<Record<SearchSort, string>> = {
  popular: "populaires",
  active: "actifs",
};

/** Lien "Voir plus" d'une section Decouvrir (doc 12 E-01) : toujours des projets. */
export function discoverSeeAllHref(seeAll: SearchParams): string {
  const params = new URLSearchParams();
  params.set("type", "projets");
  if (seeAll.tags?.length) params.set("tags", seeAll.tags.join(","));
  const urlSort = seeAll.sort ? SORT_TO_URL[seeAll.sort] : undefined;
  if (urlSort) params.set("tri", urlSort);
  return `/recherche?${params.toString()}`;
}
