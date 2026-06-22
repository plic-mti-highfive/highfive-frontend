import type {
  UpdateUserProfileDto,
  UserProfileResponse,
  EnrichedUserProfileResponse,
  UserProjectsResponse,
} from "../../types";

export interface IUserService {
  getUserProfile(userId: string): Promise<EnrichedUserProfileResponse>;
  getUserProjects(userId: string): Promise<UserProjectsResponse>;
  updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponse>;
}
