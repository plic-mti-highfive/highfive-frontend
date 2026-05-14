import type { RecommendationResultItem } from "@/api/types/ia-matchmaking.types";

/**
 * Interface for IA Matchmaking Service
 * Defines the contract for interacting with the IA backend's matchmaking endpoints
 */
export interface IIAMatchmakingService {
  /**
   * Get trending projects based on recent interactions and time-decay
   * @param limit - Maximum number of results (default: 10)
   * @returns Ranked list of trending project IDs with metadata
   */
  getTrending(limit?: number): Promise<RecommendationResultItem[]>;

  /**
   * Get project recommendations for a specific user
   * @param userId - UUID of the user
   * @param limit - Maximum number of results (default: 10)
   * @returns Ranked list of recommended project IDs with metadata
   */
  getRecommendedProjects(
    userId: string,
    limit?: number,
  ): Promise<RecommendationResultItem[]>;

  /**
   * Get user recommendations for a specific project
   * @param projectId - UUID of the project
   * @param limit - Maximum number of results (default: 10)
   * @returns Ranked list of recommended user IDs with metadata
   */
  getRecommendedUsers(
    projectId: string,
    limit?: number,
  ): Promise<RecommendationResultItem[]>;
}
