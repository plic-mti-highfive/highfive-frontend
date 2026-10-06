import { z } from "zod";
import { apiFetch } from "./client";
import {
  taskSchema,
  wallSchema,
  wallSessionSchema,
  wallSuggestionsSchema,
  type AcceptSuggestedTasksInput,
  type Task,
  type Wall,
  type WallSession,
  type WallSuggestions,
  type WallToTasksInput,
} from "@/domain";

export function getWall(slug: string): Promise<Wall> {
  return apiFetch(`/projects/${slug}/wall`, { schema: wallSchema });
}

/** R-W2 : conversion d'idees du Mur en taches dans la colonne "A faire". */
export function convertWallSelectionToTasks(
  slug: string,
  input: WallToTasksInput,
): Promise<Task[]> {
  return apiFetch(`/projects/${slug}/wall/to-tasks`, {
    method: "POST",
    body: input,
    schema: z.array(taskSchema),
  });
}

/**
 * Session du document collaboratif (observateur+) : jeton Hocuspocus a duree
 * limitee, a redemander apres expiration.
 */
export function getWallSession(slug: string): Promise<WallSession> {
  return apiFetch(`/projects/${slug}/wall/session`, {
    schema: wallSessionSchema,
  });
}

/** IA : propositions de taches deduites du Mur (membre+) ; rien n'est persiste. */
export function suggestWallTasks(slug: string): Promise<WallSuggestions> {
  return apiFetch(`/projects/${slug}/wall/suggest-tasks`, {
    method: "POST",
    schema: wallSuggestionsSchema,
  });
}

/** Cree les taches retenues parmi les propositions de l'IA (membre+). */
export function acceptSuggestedTasks(
  slug: string,
  input: AcceptSuggestedTasksInput,
): Promise<Task[]> {
  return apiFetch(`/projects/${slug}/wall/suggested-tasks`, {
    method: "POST",
    body: input,
    schema: z.array(taskSchema),
  });
}
