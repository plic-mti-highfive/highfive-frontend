import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import * as customizationApi from "../customization";
import { queryKeys } from "./keys";
import type { ProjectCustomization } from "@/domain";

/**
 * Les cartes de projet (Decouvrir, recherche, profil, "Mes projets")
 * portent `ProjectSummary.accent` : apres un changement de personnalisation,
 * toutes ces listes doivent etre rechargees. Il n'y a pas de cle racine
 * unique pour elles (voir `queryKeys`), d'ou ce predicat.
 */
export function invalidateProjectCards(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) => {
      const [root, second, third] = queryKey;
      return (
        (root === "projects" && (second === "list" || second === "mine")) ||
        root === "feed" ||
        root === "search" ||
        (root === "users" && third === "projects")
      );
    },
  });
}

export function useUpdateCustomization(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectCustomization) =>
      customizationApi.updateCustomization(slug, input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(slug), project);
      void invalidateProjectCards(queryClient);
    },
  });
}

/** L'image est televersee mais pas encore referencee : aucune requete a invalider. */
export function useUploadCustomizationImage(slug: string) {
  return useMutation({
    mutationFn: (file: File) =>
      customizationApi.uploadCustomizationImage(slug, file),
  });
}

export function useDeleteCustomizationImage(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) =>
      customizationApi.deleteCustomizationImage(slug, imageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(slug),
      });
      void invalidateProjectCards(queryClient);
    },
  });
}
