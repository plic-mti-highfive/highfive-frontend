import { z } from "zod";
import { apiFetch } from "./client";
import {
  currentUserSchema,
  projectSummarySchema,
  userSchema,
  userSummarySchema,
  type CurrentUser,
  type User,
  type UserProfileUpdateInput,
  type UserSummary,
} from "@/domain";

export function getUserByUsername(username: string): Promise<User> {
  return apiFetch(`/users/${username}`, { schema: userSchema });
}

export function updateCurrentUser(
  input: UserProfileUpdateInput,
): Promise<CurrentUser> {
  return apiFetch("/me", {
    method: "PATCH",
    body: input,
    schema: currentUserSchema,
  });
}

/** R-V4 : projets publics actifs/termines + nombre de projets prives sans les nommer. */
const userProjectsResponseSchema = z.object({
  created: z.array(projectSummarySchema),
  collaborations: z.array(projectSummarySchema),
  privateProjectsCount: z.number().int().nonnegative(),
});
export type UserProjectsResponse = z.infer<typeof userProjectsResponseSchema>;

export function getUserProjects(
  username: string,
): Promise<UserProjectsResponse> {
  return apiFetch(`/users/${username}/projects`, {
    schema: userProjectsResponseSchema,
  });
}

/** Colonne d'appui "Des gens a rencontrer" (doc 03 §3). */
export function listSuggestedPeople(): Promise<UserSummary[]> {
  return apiFetch("/feed/people", { schema: z.array(userSummarySchema) });
}
