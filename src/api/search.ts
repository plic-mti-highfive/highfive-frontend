import { z } from "zod";
import { apiFetch } from "./client";
import {
  discoverFeedSchema,
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

/**
 * Page Decouvrir (doc 06, doc 12 E-01) : "le projet du moment" hors section,
 * puis des sections thematiques courtes (3-6 projets chacune, pas de
 * pagination) avec leur lien "Voir plus" vers `/recherche`. Plus de
 * parametre `tags` : la barre de themes navigue desormais directement vers
 * `/recherche?type=projets&tags=...` (V2, retour utilisateur "clic sur un
 * tag") au lieu de filtrer ce fil sur place.
 */
export function getDiscoverFeed() {
  return apiFetch("/feed/discover", {
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
