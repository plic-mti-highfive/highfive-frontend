import { z } from "zod";
import { apiFetch } from "./client";
import {
  taskSchema,
  wallSchema,
  type Task,
  type Wall,
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
