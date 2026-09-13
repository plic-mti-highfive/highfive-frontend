import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as adminApi from "../admin";
import * as commentsApi from "../comments";
import * as projectsApi from "../projects";
import { queryKeys } from "./keys";

export function useReports(cursor?: string) {
  return useQuery({
    queryKey: queryKeys.admin.reports(cursor),
    queryFn: () => adminApi.listReports(cursor),
  });
}

/**
 * Variante "Charger la suite" (doc 17) des listes admin paginees :
 * `useInfiniteQuery` accumule les pages et rejoue proprement les refetchs
 * declenches par les invalidations (`["admin", "reports"|"users"|"projects"]`,
 * prefixes de ces cles), ce qu'une accumulation manuelle en `useState`
 * gererait mal.
 */
export function useReportsInfinite() {
  return useInfiniteQuery({
    queryKey: ["admin", "reports", "infinite"],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      adminApi.listReports(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, reason }: { reportId: string; reason?: string }) =>
      adminApi.resolveReport(reportId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

export function useRejectReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, reason }: { reportId: string; reason?: string }) =>
      adminApi.rejectReport(reportId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: adminApi.getAdminStats,
  });
}

export function useAdminUsers(cursor?: string) {
  return useQuery({
    queryKey: queryKeys.admin.users(cursor),
    queryFn: () => adminApi.listAdminUsers(cursor),
  });
}

export function useAdminUsersInfinite() {
  return useInfiniteQuery({
    queryKey: ["admin", "users", "infinite"],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      adminApi.listAdminUsers(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminApi.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

/** Leve une suspension (doc 15 E-35 : "lever la suspension"). */
export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminApi.reactivateUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminProjects(cursor?: string) {
  return useQuery({
    queryKey: queryKeys.admin.projects(cursor),
    queryFn: () => adminApi.listAdminProjects(cursor),
  });
}

export function useAdminProjectsInfinite() {
  return useInfiniteQuery({
    queryKey: ["admin", "projects", "infinite"],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      adminApi.listAdminProjects(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useAdminDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => adminApi.adminDeleteProject(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
}

/**
 * Suppression definitive d'un projet depuis l'administration : reutilise
 * `DELETE /projects/:slug` (R-PR7), deja ouvert au role admin cote handler,
 * plutot que `adminApi.adminDeleteProject` qui ne validait pas la
 * confirmation nominative exigee par le doc 17 ("saisie du titre exigee").
 */
export function useDeleteProjectAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      confirmTitle,
    }: {
      slug: string;
      confirmTitle: string;
    }) => projectsApi.deleteProject(slug, confirmTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
}

export function useAdminTags() {
  return useQuery({
    queryKey: queryKeys.admin.tags(),
    queryFn: adminApi.listAdminTags,
  });
}

/**
 * Masquer/supprimer un commentaire signale (R-C3) : la moderation agit
 * directement sur le commentaire, puis rafraichit la file de signalements
 * (l'apercu de la cible change). Reutilise `src/api/comments.ts`, deja
 * ouvert au role admin pour la suppression — aucune nouvelle route.
 */
export function useHideReportedComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.hideComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

export function useDeleteReportedComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}
