import type { IUserService } from "../interfaces";
import type {
  ListUsersQuery,
  PaginatedUsersResponse,
  UpdateUserProfileDto,
  UserProfileDto,
  UserProjectsDto,
} from "../../types";
import { httpClient } from "../../http-client";

export class UserServiceHttp implements IUserService {
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    return httpClient.get<UserProfileDto>(`/users/${userId}/profile`);
  }

  async getUserProjects(userId: string): Promise<UserProjectsDto> {
    return httpClient.get<UserProjectsDto>(`/users/${userId}/projects`);
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return httpClient.patch<UserProfileDto>(`/users/${userId}/profile`, dto);
  }

  async getSkillSuggestions(): Promise<string[]> {
    return httpClient.get<string[]>("/users/skills-suggestions");
  }

  async searchProfiles(
    query?: ListUsersQuery,
  ): Promise<PaginatedUsersResponse> {
    const { limit, offset, tags, ...rest } = query ?? {};

    const params: Record<string, string | number | boolean> = {
      ...rest,
      limit: limit ?? 20,
      offset: offset ?? 0,
    };

    if (tags && tags.length > 0) {
      params.tags = tags.join(",");
    }

    return httpClient.get<PaginatedUsersResponse>("/users", {
      params,
    });
  }
}
