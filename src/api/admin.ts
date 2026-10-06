import { z } from "zod";
import { apiFetch } from "./client";
import {
  adminProjectMediaSchema,
  adminStatsSchema,
  currentUserSchema,
  paginatedSchema,
  projectSummarySchema,
  reportSchema,
  reportSummarySchema,
  tagSchema,
  type AdminProjectMedia,
  type AdminStats,
  type CurrentUser,
  type Paginated,
  type ProjectSummary,
  type Report,
  type ReportSummary,
  type Tag,
} from "@/domain";

export function listReports(
  cursor?: string,
): Promise<Paginated<ReportSummary>> {
  return apiFetch("/admin/reports", {
    query: { cursor },
    schema: paginatedSchema(reportSummarySchema),
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

/** Leve une suspension (doc 15 E-35 : "lever la suspension"). */
export function reactivateUser(userId: string, reason?: string): Promise<void> {
  return apiFetch(`/admin/users/${userId}/reactivate`, {
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

/** Medias de personnalisation d'un projet (banniere + galerie), meme prive ou en brouillon. */
export function getAdminProjectMedia(slug: string): Promise<AdminProjectMedia> {
  return apiFetch(`/admin/projects/${slug}/media`, {
    schema: adminProjectMediaSchema,
  });
}

export function listAdminTags(): Promise<Tag[]> {
  return apiFetch("/admin/tags", { schema: z.array(tagSchema) });
}
