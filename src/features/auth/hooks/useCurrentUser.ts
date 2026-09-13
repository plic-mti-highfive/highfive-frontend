import { useSession } from "@/api/queries/auth";
import { tokenStorage } from "@/api/http-client";

/**
 * Session courante (V2, item 2), gardee par la presence d'un jeton stocke :
 * evite un appel /api/me systematique pour un visiteur anonyme. Base de
 * `useAuth()` (src/shared/contexts/AuthContext.tsx) et reutilisable
 * directement par tout composant qui n'a besoin que de la lecture, sans les
 * actions de connexion/deconnexion.
 */
export function useCurrentUser() {
  const hasToken = Boolean(tokenStorage.getAccessToken());
  const session = useSession({ enabled: hasToken });

  return {
    user: session.data ?? null,
    isAuthenticated: Boolean(session.data),
    // Sans jeton, il n'y a rien a attendre : le visiteur est anonyme, pas
    // "en cours de chargement" (la requete /me n'est meme pas declenchee).
    isLoading: hasToken ? session.isLoading : false,
  };
}
