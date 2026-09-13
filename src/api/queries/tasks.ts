import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "../tasks";
import { queryKeys } from "./keys";
import type {
  ColumnCreateInput,
  Task,
  TaskCreateInput,
  TaskMoveInput,
  TaskUpdateInput,
} from "@/domain";

export function useColumns(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.columns(slug),
    queryFn: () => tasksApi.listColumns(slug),
    enabled: Boolean(slug),
  });
}

/** R-K2 : de 1 a 6 colonnes, verifie cote handler. */
export function useCreateColumn(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ColumnCreateInput) =>
      tasksApi.createColumn(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.columns(slug),
      });
    },
  });
}

/** R-K3 : supprimer une colonne exige de choisir ou deplacer ses taches. */
export function useDeleteColumn(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, moveTo }: { columnId: string; moveTo: string }) =>
      tasksApi.deleteColumn(columnId, moveTo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.columns(slug),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
    },
  });
}

export function useTasks(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.tasks(slug),
    queryFn: () => tasksApi.listTasks(slug),
    enabled: Boolean(slug),
  });
}

/** R-K4 : seul le titre est obligatoire. */
export function useCreateTask(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskCreateInput) => tasksApi.createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
    },
  });
}

/** R-K7 : assigner quelqu'un notifie ; le reste ne notifie pas (gere cote handler). */
export function useUpdateTask(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: TaskUpdateInput;
    }) => tasksApi.updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
    },
  });
}

/** Glisser-deposer entre colonnes : mise a jour optimiste de la liste en cache. */
export function useMoveTask(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: TaskMoveInput }) =>
      tasksApi.moveTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
      const previous = queryClient.getQueryData<Task[]>(
        queryKeys.projects.tasks(slug),
      );
      if (previous) {
        queryClient.setQueryData<Task[]>(
          queryKeys.projects.tasks(slug),
          previous.map((task) =>
            task.id === taskId
              ? { ...task, columnId: input.columnId, order: input.order }
              : task,
          ),
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.projects.tasks(slug),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
    },
  });
}

export function useDeleteTask(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(slug),
      });
    },
  });
}
