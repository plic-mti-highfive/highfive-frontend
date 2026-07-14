import { useAuth } from "@shared/contexts";

/**
 * S'appuie sur AuthContext (déjà chargé au niveau app) plutôt que de
 * re-fetcher l'utilisateur courant : en mode mock, un second appel à
 * authService.getCurrentUser() renvoie systématiquement le premier
 * utilisateur de la base, pas celui réellement connecté.
 */
export function useProfilePanelData() {
  const { user, isLoading } = useAuth();

  const handle = user?.email?.split("@")[0] || "invite";
  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);

  return {
    userId: user?.id ?? null,
    displayName,
    handle,
    isLoading,
  };
}
