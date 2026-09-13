import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as adminApi from "../admin";
import { queryKeys } from "./keys";

export function useReports(cursor?: string) {
  return useQuery({
    queryKey: queryKeys.admin.reports(cursor),
    queryFn: () => adminApi.listReports(cursor),
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

export function useAdminProjects(cursor?: string) {
  return useQuery({
    queryKey: queryKeys.admin.projects(cursor),
    queryFn: () => adminApi.listAdminProjects(cursor),
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

export function useAdminTags() {
  return useQuery({
    queryKey: queryKeys.admin.tags(),
    queryFn: adminApi.listAdminTags,
  });
}
