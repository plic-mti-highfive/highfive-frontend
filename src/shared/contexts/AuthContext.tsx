import type { ReactNode } from "react";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { useLogin, useLogout } from "@/api/queries/auth";

/**
 * Provider mince (V2, item 2 du chantier v2 "socle applicatif") : l'etat de
 * session ne vit plus dans un React Context mais dans le cache TanStack
 * Query, deja partage globalement par `QueryClientProvider`
 * (src/app/providers.tsx) — voir `useCurrentUser` (src/features/auth). Ce
 * composant ne fait plus rien lui-meme ; il est conserve uniquement pour ne
 * pas casser l'arbre de `src/main.tsx` ni les imports existants
 * (`@shared/contexts`) pendant que d'autres features migrent.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Compat pour les features qui ne sont pas dans le perimetre de ce lot
 * (admin, messages, notifications) : memes champs qu'avant
 * (`user`, `isAuthenticated`, `isLoading`, `login`, `logout`), mais `user`
 * est desormais un `CurrentUser` du domaine (src/domain/user.ts) — plus de
 * `user.profile.avatarPath` (-> `user.avatar`) ni de `user.systemRole`
 * (-> `user.platformRole`, valeurs "member" | "admin").
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  return {
    user,
    isAuthenticated,
    isLoading,
    login: async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };
}
