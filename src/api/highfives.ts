import { z } from "zod";
import { apiFetch } from "./client";
import {
  paginatedSchema,
  userSummarySchema,
  type Paginated,
  type UserSummary,
} from "@/domain";

/**
 * R-H1/R-H3 : un highfive par personne et par projet, reversible et
 * public. La reponse renvoie le compteur recalcule cote serveur (R-X2),
 * jamais decompte cote client.
 */
export const highfiveToggleResponseSchema = z.object({
  given: z.boolean(),
  highfiveCount: z.number().int().nonnegative(),
});
export type HighfiveToggleResponse = z.infer<
  typeof highfiveToggleResponseSchema
>;

export function giveHighfive(slug: string): Promise<HighfiveToggleResponse> {
  return apiFetch(`/projects/${slug}/highfive`, {
    method: "POST",
    schema: highfiveToggleResponseSchema,
  });
}

export function withdrawHighfive(
  slug: string,
): Promise<HighfiveToggleResponse> {
  return apiFetch(`/projects/${slug}/highfive`, {
    method: "DELETE",
    schema: highfiveToggleResponseSchema,
  });
}

export function listProjectHighfivers(
  slug: string,
  cursor?: string,
): Promise<Paginated<UserSummary>> {
  return apiFetch(`/projects/${slug}/highfives`, {
    query: { cursor },
    schema: paginatedSchema(userSummarySchema),
  });
}
