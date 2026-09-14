import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../auth";
import { ApiError } from "../client";
import { tokenStorage } from "../token-storage";
import { queryKeys } from "./keys";
import type { LoginInput, RegisterInput } from "@/domain";

/**
 * Session courante. Un 401 n'est pas une erreur mais "personne n'est connecte" :
 * le jeton perime est efface et la session vaut `null`. Sans cela, chaque
 * nouvel observateur relancait /me sur une requete en erreur, repassait la
 * session en chargement et faisait remonter les pages en boucle.
 */
export function useSession(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          tokenStorage.clearTokens();
          return null;
        }
        throw error;
      }
    },
    enabled: options.enabled ?? true,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (session) => {
      // Le jeton doit etre persiste avant tout : apiFetch (src/api/client.ts)
      // le relit depuis tokenStorage pour authentifier les requetes suivantes
      // (ex. le prochain GET /me). Sans cet appel la connexion "reussissait"
      // sans jamais authentifier la moindre requete apres.
      tokenStorage.setAccessToken(session.token);
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
      // Le fil, les droits et les compteurs dependent de la personne : ce qui
      // a ete mis en cache en visiteur ne vaut plus.
      void queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (session) => {
      tokenStorage.setAccessToken(session.token);
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
      void queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      tokenStorage.clearTokens();
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.clear();
    },
  });
}
