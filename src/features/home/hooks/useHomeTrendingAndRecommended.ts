import { useState, useEffect } from "react";
import { projectService, iaMatchmakingService } from "@/api";
import type { Project } from "@shared/types";
import { adaptProjects } from "../adapters";
import { useCurrentUser } from "@/api/hooks/useCurrentUser";
import type { RecommendationResultItem } from "@/api/types/ia-matchmaking.types";

export function useHomeTrendingAndRecommended() {
  const { userId } = useCurrentUser();
  const [recommended, setRecommended] = useState<Project[]>([]);
  const [trending, setTrending] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const trendingItems = await iaMatchmakingService.getTrending(20);

        let recommendedItems: RecommendationResultItem[] = [];
        if (userId) {
          recommendedItems = await iaMatchmakingService.getRecommendedProjects(
            userId,
            20,
          );
        }

        const trendingProjectIds = trendingItems.map((item) => item.id);
        const recommendedProjectIds = recommendedItems.map((item) => item.id);

        const projectDtos = await projectService.getProjectsByIds([
          ...trendingProjectIds,
          ...recommendedProjectIds,
        ]);

        const adaptedProjects = adaptProjects(projectDtos);

        // Associer les projets adaptés avec les résultats de matchmaking pour conserver l'ordre et les métadonnées
        const recommendedProjects = recommendedItems
          .map((item) =>
            adaptedProjects.find((project) => project.id === item.id),
          )
          .filter((project): project is Project => project !== undefined);

        const trendingProjects = trendingItems
          .map((item) =>
            adaptedProjects.find((project) => project.id === item.id),
          )
          .filter((project): project is Project => project !== undefined);

        setRecommended(recommendedProjects);
        setTrending(trendingProjects);
      } catch (err) {
        console.error(
          "Failed to fetch trending and recommended projects:",
          err,
        );
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur inconnue lors du chargement des projets";

        const enhancedError = new Error(errorMessage);
        enhancedError.stack = err instanceof Error ? err.stack : undefined;
        setError(enhancedError);

        // Reset categories on error
        setRecommended([]);
        setTrending([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return {
    recommended,
    trending,
    isLoading,
    error,
  };
}
