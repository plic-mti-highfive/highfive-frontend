import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../users";
import { queryKeys } from "./keys";
import type { UserProfileUpdateInput } from "@/domain";

export function useUser(username: string) {
  return useQuery({
    queryKey: queryKeys.users.byUsername(username),
    queryFn: () => usersApi.getUserByUsername(username),
    enabled: Boolean(username),
  });
}

export function useUserProjects(username: string) {
  return useQuery({
    queryKey: queryKeys.users.projects(username),
    queryFn: () => usersApi.getUserProjects(username),
    enabled: Boolean(username),
  });
}

export function useSuggestedPeople() {
  return useQuery({
    queryKey: queryKeys.users.suggestedPeople(),
    queryFn: usersApi.listSuggestedPeople,
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserProfileUpdateInput) =>
      usersApi.updateCurrentUser(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.byUsername(user.username),
      });
    },
  });
}
