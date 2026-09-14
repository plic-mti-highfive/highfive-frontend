import { useQuery } from "@tanstack/react-query";
import * as searchApi from "../search";
import { queryKeys } from "./keys";
import type { SearchParams } from "@/domain";

/** R-R4 : les parametres vivent dans l'URL, l'appelant les extrait de la query string. */
export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: queryKeys.search.results(params),
    queryFn: () => searchApi.search(params),
    enabled: Boolean(params.q || params.tags?.length),
  });
}

/** `tags` (additif) : filtre du fil par la barre de themes (doc 12 E-01). */
export function useDiscoverFeed(cursor?: string, tags?: string[]) {
  return useQuery({
    queryKey: queryKeys.feed.discover(cursor, tags),
    queryFn: () => searchApi.getDiscoverFeed(cursor, tags),
  });
}

export function useProjectsByTag(tagId: string, cursor?: string) {
  return useQuery({
    queryKey: queryKeys.feed.byTag(tagId, cursor),
    queryFn: () => searchApi.getProjectsByTag(tagId, cursor),
    enabled: Boolean(tagId),
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
