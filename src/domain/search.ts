import { z } from "zod";
import { paginatedSchema } from "./common";
import { projectSummarySchema } from "./project";
import { tagSchema } from "./tag";
import { userSummarySchema } from "./user";

/**
 * Parametres de recherche (doc 06 R-R4) : vivent dans la chaine de requete
 * `/recherche?q=...&type=...&tags=...&tri=...`. Remplace les `unknown` de
 * l'ancien `GlobalSearchResponse` (tags/progress) par des schemas typés.
 */
export const searchEntityTypeSchema = z.enum(["projects", "users", "tags"]);
export type SearchEntityType = z.infer<typeof searchEntityTypeSchema>;

/**
 * `active` ajoute (additif) pour porter le tri "Les plus actifs" du doc 12
 * (E-02) : distinct de `relevant` (pertinence texte) et de `recent`
 * (creation), il trie par `lastActivityAt`.
 */
export const searchSortSchema = z.enum([
  "recent",
  "popular",
  "relevant",
  "active",
]);
export type SearchSort = z.infer<typeof searchSortSchema>;

export const searchParamsSchema = z.object({
  q: z.string().max(200).optional(),
  types: z.array(searchEntityTypeSchema).optional(),
  tags: z.array(z.string()).optional(),
  sort: searchSortSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type SearchParams = z.infer<typeof searchParamsSchema>;

export const searchResultsSchema = z.object({
  projects: paginatedSchema(projectSummarySchema).optional(),
  users: paginatedSchema(userSummarySchema).optional(),
  tags: paginatedSchema(tagSchema).optional(),
});
export type SearchResults = z.infer<typeof searchResultsSchema>;

/** Colonne d'appui "Ce qui bouge en ce moment" (doc 12 E-01). */
export const trendingTagSchema = z.object({
  tag: tagSchema,
  projectsCount: z.number().int().nonnegative(),
});
export type TrendingTag = z.infer<typeof trendingTagSchema>;
