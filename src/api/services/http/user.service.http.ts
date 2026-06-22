import type { IUserService } from "../interfaces";
import type {
  UpdateUserProfileDto,
  UserProfileResponse,
  EnrichedUserProfileResponse,
  UserProjectsResponse,
} from "../../types";
import { httpClient } from "../../http-client";

export class UserServiceHttp implements IUserService {
  async getUserProfile(userId: string): Promise<EnrichedUserProfileResponse> {
    return httpClient.get<EnrichedUserProfileResponse>(
      `/users/${userId}/profile`,
    );
  }

  async getUserProjects(userId: string): Promise<UserProjectsResponse> {
    return httpClient.get<UserProjectsResponse>(`/users/${userId}/projects`);
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponse> {
    return httpClient.patch<UserProfileResponse>(
      `/users/${userId}/profile`,
      dto,
    );
  }
}
