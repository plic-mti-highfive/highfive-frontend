import { z } from "zod";
import { apiFetch } from "./client";
import {
  paginatedSchema,
  projectSchema,
  projectSummarySchema,
  projectTransitionSchema,
  type Paginated,
  type Project,
  type ProjectCreateInput,
  type ProjectSummary,
  type ProjectTransition,
  type ProjectUpdateInput,
} from "@/domain";
import type { QueryValue } from "./client";

export interface ListProjectsQuery {
  q?: string;
  tags?: string[];
  participation?: string;
  sort?: "recent" | "popular" | "relevant";
  cursor?: string;
  limit?: number;
}

export function listProjects(
  query: ListProjectsQuery = {},
): Promise<Paginated<ProjectSummary>> {
  return apiFetch("/projects", {
    query: query as Record<string, QueryValue>,
    schema: paginatedSchema(projectSummarySchema),
  });
}

export function getProject(slug: string): Promise<Project> {
  return apiFetch(`/projects/${slug}`, { schema: projectSchema });
}

export function createProject(input: ProjectCreateInput): Promise<Project> {
  return apiFetch("/projects", {
    method: "POST",
    body: input,
    schema: projectSchema,
  });
}

export function updateProject(
  slug: string,
  input: ProjectUpdateInput,
): Promise<Project> {
  return apiFetch(`/projects/${slug}`, {
    method: "PATCH",
    body: input,
    schema: projectSchema,
  });
}

/** R-PR3..R-PR6 : transitions d'etat explicites plutot qu'un PATCH `state` libre. */
export function transitionProject(
  slug: string,
  transition: ProjectTransition,
): Promise<Project> {
  return apiFetch(`/projects/${slug}/transition`, {
    method: "POST",
    body: { transition: projectTransitionSchema.parse(transition) },
    schema: projectSchema,
  });
}

/** R-PR7 : suppression definitive, confirmation nominative (saisie du titre). */
export function deleteProject(
  slug: string,
  confirmTitle: string,
): Promise<void> {
  return apiFetch(`/projects/${slug}`, {
    method: "DELETE",
    body: { confirmTitle },
  });
}

export function transferProjectOwnership(
  slug: string,
  newOwnerId: string,
): Promise<Project> {
  return apiFetch(`/projects/${slug}/transfer`, {
    method: "POST",
    body: { newOwnerId },
    schema: projectSchema,
  });
}

const projectsResponseSchema = z.array(projectSummarySchema);

export function listMyProjects(): Promise<ProjectSummary[]> {
  return apiFetch("/me/projects", { schema: projectsResponseSchema });
}
