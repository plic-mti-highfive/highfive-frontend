export interface RecommendationResultItem {
  id: string; // UUID of the project/user
  position: number; // 0-based position in the ranked list
  metadata?: Record<string, unknown>;
}

export type RecommendationResponse = RecommendationResultItem[];
