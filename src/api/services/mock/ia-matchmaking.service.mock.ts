import type { IIAMatchmakingService } from "../interfaces/ia-matchmaking.service.interface";
import type { RecommendationResultItem } from "@/api/types/ia-matchmaking.types";

/**
 * Mock Implementation of IA Matchmaking Service
 * Returns mock data for offline development
 */
export class IAMatchmakingServiceMock implements IIAMatchmakingService {
  /**
   * Generate mock trending projects with consistent positions and metadata
   */
  private getMockTrendingProjects(
    limit: number = 10,
  ): RecommendationResultItem[] {
    const mockIds = [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003",
      "550e8400-e29b-41d4-a716-446655440004",
      "550e8400-e29b-41d4-a716-446655440005",
      "550e8400-e29b-41d4-a716-446655440006",
      "550e8400-e29b-41d4-a716-446655440007",
      "550e8400-e29b-41d4-a716-446655440008",
      "550e8400-e29b-41d4-a716-446655440009",
      "550e8400-e29b-41d4-a716-446655440010",
    ];

    return mockIds.slice(0, limit).map((id, index) => ({
      id,
      position: index,
      metadata: {
        likes: Math.floor(Math.random() * 100),
        tags: ["Mock", "Trending"],
      },
    }));
  }

  /**
   * Generate mock recommended projects for a user
   */
  private getMockRecommendedProjects(
    userId: string,
    limit: number = 10,
  ): RecommendationResultItem[] {
    // Use userId to seed consistent but different results per user
    const seed = userId.charCodeAt(0);
    const mockIds = [
      "650e8400-e29b-41d4-a716-446655440001",
      "650e8400-e29b-41d4-a716-446655440002",
      "650e8400-e29b-41d4-a716-446655440003",
      "650e8400-e29b-41d4-a716-446655440004",
      "650e8400-e29b-41d4-a716-446655440005",
      "650e8400-e29b-41d4-a716-446655440006",
      "650e8400-e29b-41d4-a716-446655440007",
      "650e8400-e29b-41d4-a716-446655440008",
      "650e8400-e29b-41d4-a716-446655440009",
      "650e8400-e29b-41d4-a716-446655440010",
    ];

    return mockIds.slice(0, limit).map((id, index) => ({
      id,
      position: index,
      metadata: {
        likes: (seed + index * 7) % 50,
        tags: ["Mock", "Recommended", "User-Specific"],
      },
    }));
  }

  /**
   * Generate mock recommended users for a project
   */
  private getMockRecommendedUsers(
    projectId: string,
    limit: number = 10,
  ): RecommendationResultItem[] {
    // Use projectId to seed consistent but different results per project
    const seed = projectId.charCodeAt(0);
    const mockIds = [
      "750e8400-e29b-41d4-a716-446655440001",
      "750e8400-e29b-41d4-a716-446655440002",
      "750e8400-e29b-41d4-a716-446655440003",
      "750e8400-e29b-41d4-a716-446655440004",
      "750e8400-e29b-41d4-a716-446655440005",
      "750e8400-e29b-41d4-a716-446655440006",
      "750e8400-e29b-41d4-a716-446655440007",
      "750e8400-e29b-41d4-a716-446655440008",
      "750e8400-e29b-41d4-a716-446655440009",
      "750e8400-e29b-41d4-a716-446655440010",
    ];

    return mockIds.slice(0, limit).map((id, index) => ({
      id,
      position: index,
      metadata: {
        likes: (seed + index * 5) % 40,
        tags: ["Mock", "Recommended", "Project-Specific"],
      },
    }));
  }

  async getTrending(limit?: number): Promise<RecommendationResultItem[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.getMockTrendingProjects(limit || 10);
  }

  async getRecommendedProjects(
    userId: string,
    limit?: number,
  ): Promise<RecommendationResultItem[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.getMockRecommendedProjects(userId, limit || 10);
  }

  async getRecommendedUsers(
    projectId: string,
    limit?: number,
  ): Promise<RecommendationResultItem[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.getMockRecommendedUsers(projectId, limit || 10);
  }
}
