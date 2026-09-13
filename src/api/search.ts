import { z } from "zod";
import { apiFetch } from "./client";
import {
  paginatedSchema,
  projectSummarySchema,
  searchResultsSchema,
  type Paginated,
  type ProjectSummary,
  type SearchParams,
  type SearchResults,
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

/** Page Decouvrir (doc 06) : "le projet du moment" + fil recommande. */
export function getDiscoverFeed(cursor?: string): Promise<DiscoverFeed> {
  return apiFetch("/feed/discover", {
    query: { cursor },
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
