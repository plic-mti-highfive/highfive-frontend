import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as projectsApi from "../projects";
import { queryKeys } from "./keys";
import type {
  ProjectCreateInput,
  ProjectTransition,
  ProjectUpdateInput,
} from "@/domain";

export function useProjects(query: projectsApi.ListProjectsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(query),
    queryFn: () => projectsApi.listProjects(query),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: () => projectsApi.getProject(slug),
    enabled: Boolean(slug),
  });
}

export function useMyProjects() {
  return useQuery({
    queryKey: queryKeys.projects.mine(),
    queryFn: projectsApi.listMyProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectCreateInput) => projectsApi.createProject(input),
    onSuccess: (project) => {
      queryClient.setQueryData(
        queryKeys.projects.detail(project.slug),
        project,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
    },
  });
}

export function useUpdateProject(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectUpdateInput) =>
      projectsApi.updateProject(slug, input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(slug), project);
    },
  });
}

/** R-PR3..R-PR6 : publier/terminer/rouvrir/archiver/reactiver. */
export function useTransitionProject(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transition: ProjectTransition) =>
      projectsApi.transitionProject(slug, transition),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(slug), project);
    },
  });
}

/** R-PR7 : confirmation nominative (saisie du titre) portee par l'appelant. */
export function useDeleteProject(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmTitle: string) =>
      projectsApi.deleteProject(slug, confirmTitle),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(slug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
    },
  });
}

export function useTransferProjectOwnership(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId: string) =>
      projectsApi.transferProjectOwnership(slug, newOwnerId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(slug), project);
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(slug),
      });
    },
  });
}
