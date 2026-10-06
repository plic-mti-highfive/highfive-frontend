import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as wallApi from "../wall";
import { queryKeys } from "./keys";
import type { AcceptSuggestedTasksInput, WallToTasksInput } from "@/domain";

export function useWall(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.wall(slug),
    queryFn: () => wallApi.getWall(slug),
    enabled: Boolean(slug),
  });
}

/** R-W2 : conversion d'idees du Mur en taches (colonne "A faire"). */
export function useConvertWallSelectionToTasks(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WallToTasksInput) =>
      wallApi.convertWallSelectionToTasks(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
    },
  });
}

/**
 * Session du Mur collaboratif. Le jeton est a duree limitee : jamais
 * rafraichi en arriere-plan (ce serait ouvrir une seconde connexion), c'est
 * `useWallSync` qui le redemande explicitement a la reconnexion.
 */
export function useWallSession(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.wallSession(slug),
    queryFn: () => wallApi.getWallSession(slug),
    enabled: enabled && Boolean(slug),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/** IA : propose des taches a partir du Mur (action explicite, rien de persiste). */
export function useSuggestWallTasks(slug: string) {
  return useMutation({
    mutationFn: () => wallApi.suggestWallTasks(slug),
  });
}

/** Cree les taches retenues parmi les propositions de l'IA. */
export function useAcceptSuggestedTasks(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AcceptSuggestedTasksInput) =>
      wallApi.acceptSuggestedTasks(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
    },
  });
}
