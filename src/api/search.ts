import { z } from "zod";
import { apiFetch } from "./client";
import {
  paginatedSchema,
  projectSummarySchema,
  searchResultsSchema,
  trendingTagSchema,
  type Paginated,
  type ProjectSummary,
  type SearchParams,
  type SearchResults,
  type TrendingTag,
} from "@/domain";

export function search(params: SearchParams): Promise<SearchResults> {
  return apiFetch("/search", {
    query: {
      q: params.q,
      types: params.types,
      tags: params.tags,
      sort: params.sort,
      cursor: params.cursor,
      limit: params.limit,
    },
    schema: searchResultsSchema,
  });
}

const discoverFeedSchema = z.object({
  moment: projectSummarySchema.nullable(),
  items: paginatedSchema(projectSummarySchema),
});
export type DiscoverFeed = z.infer<typeof discoverFeedSchema>;

/**
 * Page Decouvrir (doc 06) : "le projet du moment" + fil recommande. `tags`
 * (additif) filtre le fil par la barre de themes (doc 12 E-01) ; le projet du
 * moment reste hors filtre (un seul, independant de la selection).
 */
export function getDiscoverFeed(
  cursor?: string,
  tags?: string[],
): Promise<DiscoverFeed> {
  return apiFetch("/feed/discover", {
    query: { cursor, tags },
    schema: discoverFeedSchema,
  });
}

/** Page d'un theme (`/tags/:tag`). */
export function getProjectsByTag(
  tagId: string,
  cursor?: string,
): Promise<Paginated<ProjectSummary>> {
  return apiFetch(`/tags/${tagId}/projects`, {
    query: { cursor },
    schema: paginatedSchema(projectSummarySchema),
  });
}

/** Colonne d'appui "Ce qui bouge en ce moment" (doc 12 E-01) : 5 maximum. */
export function getTrendingTags(): Promise<TrendingTag[]> {
  return apiFetch("/feed/tags-trending", {
    schema: z.array(trendingTagSchema),
  });
}
