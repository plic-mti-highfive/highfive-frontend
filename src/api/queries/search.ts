import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as searchApi from "../search";
import { queryKeys } from "./keys";
import type { SearchParams } from "@/domain";

/**
 * R-R4 : les parametres vivent dans l'URL, l'appelant les extrait de la
 * query string. `placeholderData: keepPreviousData` (V2, retour util. 5) :
 * chaque frappe/filtre change `queryKey`, garder les anciens resultats a
 * l'ecran le temps de la requete suivante evite un flash de squelette vide
 * a chaque caractere tape.
 */
export function useSearch(
  params: SearchParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.search.results(params),
    queryFn: () => searchApi.search(params),
    enabled: options?.enabled ?? Boolean(params.q || params.tags?.length),
    placeholderData: keepPreviousData,
  });
}

/** Fil Decouvrir (doc 12 E-01) : "projet du moment" + sections thematiques, sans pagination. */
export function useDiscoverFeed() {
  return useQuery({
    queryKey: queryKeys.feed.discover(),
    queryFn: searchApi.getDiscoverFeed,
  });
}

/** `placeholderData: keepPreviousData` (V2, retour util. 5) : pagination par curseur, evite le flash au changement de page. */
export function useProjectsByTag(tagId: string, cursor?: string) {
  return useQuery({
    queryKey: queryKeys.feed.byTag(tagId, cursor),
    queryFn: () => searchApi.getProjectsByTag(tagId, cursor),
    enabled: Boolean(tagId),
    placeholderData: keepPreviousData,
  });
}

/** Colonne d'appui "Ce qui bouge en ce moment" (doc 12 E-01). Liste fermee de tags : cache long. */
export function useTrendingTags() {
  return useQuery({
    queryKey: queryKeys.feed.trendingTags(),
    queryFn: searchApi.getTrendingTags,
    staleTime: 60 * 1000,
  });
}
