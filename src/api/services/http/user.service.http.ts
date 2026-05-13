import type { IUserService } from "../interfaces";
import type { UpdateUserProfileDto, UserProfileResponse } from "../../types";
import { httpClient } from "../../http-client";

export class UserServiceHttp implements IUserService {
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    return httpClient.get<UserProfileResponse>(`/users/${userId}/profile`);
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
