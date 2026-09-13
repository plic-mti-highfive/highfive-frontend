import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../auth";
import { queryKeys } from "./keys";
import type { LoginInput, RegisterInput } from "@/domain";

/** Session courante. `enabled: hasToken` evite un appel systematique si l'AuthContext gere deja ce cas. */
export function useSession(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getCurrentUser,
    enabled: options.enabled ?? true,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.clear();
    },
  });
}
