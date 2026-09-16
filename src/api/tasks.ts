import { z } from "zod";
import { apiFetch } from "./client";
import {
  columnSchema,
  taskSchema,
  type Column,
  type ColumnCreateInput,
  type Task,
  type TaskCreateInput,
  type TaskMoveInput,
  type TaskUpdateInput,
} from "@/domain";

export function listColumns(slug: string): Promise<Column[]> {
  return apiFetch(`/projects/${slug}/columns`, {
    schema: z.array(columnSchema),
  });
}

/** R-K2 : de 1 a 6 colonnes par projet, verifie cote handler. */
export function createColumn(
  slug: string,
  input: ColumnCreateInput,
): Promise<Column> {
  return apiFetch(`/projects/${slug}/columns`, {
    method: "POST",
    body: input,
    schema: columnSchema,
  });
}

/** R-K3 : supprimer une colonne exige de choisir ou deplacer ses taches. */
export function deleteColumn(
  columnId: string,
  moveTasksToColumnId: string,
): Promise<void> {
  return apiFetch(`/columns/${columnId}`, {
    method: "DELETE",
    query: { moveTo: moveTasksToColumnId },
  });
}

export function listTasks(slug: string): Promise<Task[]> {
  return apiFetch(`/projects/${slug}/tasks`, { schema: z.array(taskSchema) });
}

export function createTask(input: TaskCreateInput): Promise<Task> {
  return apiFetch("/tasks", {
    method: "POST",
    body: input,
    schema: taskSchema,
  });
}

export function updateTask(
  taskId: string,
  input: TaskUpdateInput,
): Promise<Task> {
  return apiFetch(`/tasks/${taskId}`, {
    method: "PATCH",
    body: input,
    schema: taskSchema,
  });
}

export function moveTask(taskId: string, input: TaskMoveInput): Promise<Task> {
  return apiFetch(`/tasks/${taskId}/move`, {
    method: "POST",
    body: input,
    schema: taskSchema,
  });
}

export function deleteTask(taskId: string): Promise<void> {
  return apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
}
