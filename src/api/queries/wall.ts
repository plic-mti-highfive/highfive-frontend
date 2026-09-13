import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as wallApi from "../wall";
import { queryKeys } from "./keys";
import type { WallToTasksInput } from "@/domain";

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
