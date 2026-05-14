import type { IIAMatchmakingService } from "../interfaces/ia-matchmaking.service.interface";
import type { RecommendationResultItem } from "@/api/types/ia-matchmaking.types";
import { apiConfig } from "@/api/config";
import { tokenStorage, ApiError } from "@/api/http-client";

/**
 * HTTP Implementation of IA Matchmaking Service
 * Calls the separate IA backend instance for trending/recommendations
 */
export class IAMatchmakingServiceHttp implements IIAMatchmakingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.iaApiUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = tokenStorage.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  private async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async getTrending(limit?: number): Promise<RecommendationResultItem[]> {
    const params = limit ? { limit } : undefined;
    return this.get<RecommendationResultItem[]>(
      "/matchmaking/trending",
      params,
    );
  }

  async getRecommendedProjects(
    userId: string,
    limit?: number,
  ): Promise<RecommendationResultItem[]> {
    const params = limit ? { limit } : undefined;
    return this.get<RecommendationResultItem[]>(
      `/matchmaking/users/${userId}/projects`,
      params,
    );
  }

  async getRecommendedUsers(
    projectId: string,
    limit?: number,
  ): Promise<RecommendationResultItem[]> {
    const params = limit ? { limit } : undefined;
    return this.get<RecommendationResultItem[]>(
      `/matchmaking/projects/${projectId}/users`,
      params,
    );
  }
}
