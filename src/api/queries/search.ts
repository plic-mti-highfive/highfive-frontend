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

export function useDiscoverFeed(cursor?: string) {
  return useQuery({
    queryKey: queryKeys.feed.discover(cursor),
    queryFn: () => searchApi.getDiscoverFeed(cursor),
  });
}

export function useProjectsByTag(tagId: string, cursor?: string) {
  return useQuery({
    queryKey: queryKeys.feed.byTag(tagId, cursor),
    queryFn: () => searchApi.getProjectsByTag(tagId, cursor),
    enabled: Boolean(tagId),
  });
}
