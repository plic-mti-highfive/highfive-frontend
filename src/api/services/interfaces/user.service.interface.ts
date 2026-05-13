import type { UpdateUserProfileDto, UserProfileResponse } from "../../types";

export interface IUserService {
  getUserProfile(userId: string): Promise<UserProfileResponse>;
  updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponse>;
}
