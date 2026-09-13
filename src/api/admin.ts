import { z } from "zod";
import { apiFetch } from "./client";
import {
  adminStatsSchema,
  currentUserSchema,
  paginatedSchema,
  projectSummarySchema,
  reportSchema,
  tagSchema,
  type AdminStats,
  type CurrentUser,
  type Paginated,
  type ProjectSummary,
  type Report,
  type Tag,
} from "@/domain";

export function listReports(cursor?: string): Promise<Paginated<Report>> {
  return apiFetch("/admin/reports", {
    query: { cursor },
    schema: paginatedSchema(reportSchema),
  });
}

export function resolveReport(
  reportId: string,
  reason?: string,
): Promise<Report> {
  return apiFetch(`/admin/reports/${reportId}/resolve`, {
    method: "POST",
    body: { reason },
    schema: reportSchema,
  });
}

export function rejectReport(
  reportId: string,
  reason?: string,
): Promise<Report> {
  return apiFetch(`/admin/reports/${reportId}/reject`, {
    method: "POST",
    body: { reason },
    schema: reportSchema,
  });
}

export function getAdminStats(): Promise<AdminStats> {
  return apiFetch("/admin/stats", { schema: adminStatsSchema });
}

export function listAdminUsers(
  cursor?: string,
): Promise<Paginated<CurrentUser>> {
  return apiFetch("/admin/users", {
    query: { cursor },
    schema: paginatedSchema(currentUserSchema),
  });
}

export function suspendUser(userId: string, reason?: string): Promise<void> {
  return apiFetch(`/admin/users/${userId}/suspend`, {
    method: "POST",
    body: { reason },
  });
}

export function listAdminProjects(
  cursor?: string,
): Promise<Paginated<ProjectSummary>> {
  return apiFetch("/admin/projects", {
    query: { cursor },
    schema: paginatedSchema(projectSummarySchema),
  });
}

/** R-PR7 : suppression reservee au porteur et a l'administration. */
export function adminDeleteProject(slug: string): Promise<void> {
  return apiFetch(`/admin/projects/${slug}`, { method: "DELETE" });
}

export function listAdminTags(): Promise<Tag[]> {
  return apiFetch("/admin/tags", { schema: z.array(tagSchema) });
}
