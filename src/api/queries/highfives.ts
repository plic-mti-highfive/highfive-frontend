import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as highfivesApi from "../highfives";
import { queryKeys } from "./keys";
import type { Project } from "@/domain";

export function useProjectHighfivers(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.highfivers(slug),
    queryFn: () => highfivesApi.listProjectHighfivers(slug),
    enabled: Boolean(slug),
  });
}

/**
 * R-H1 : bascule reversible, avec mise a jour optimiste du compteur sur la
 * fiche projet en cache. R-H2 (porteur ne peut pas highfiver son propre
 * projet) est verifie cote handler ; en cas de 403 le rollback restaure
 * l'etat precedent.
 */
export function useToggleHighfive(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (given: boolean) =>
      given
        ? highfivesApi.withdrawHighfive(slug)
        : highfivesApi.giveHighfive(slug),
    onMutate: async (currentlyGiven: boolean) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.detail(slug),
      });
      const previous = queryClient.getQueryData<Project>(
        queryKeys.projects.detail(slug),
      );
      if (previous) {
        queryClient.setQueryData<Project>(queryKeys.projects.detail(slug), {
          ...previous,
          highfiveCount: previous.highfiveCount + (currentlyGiven ? -1 : 1),
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.projects.detail(slug),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(slug),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.highfivers(slug),
      });
    },
  });
}
