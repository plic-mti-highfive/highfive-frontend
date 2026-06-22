import type {
  UpdateUserProfileDto,
  UserProfileDto,
  UserProjectsDto,
} from "../../types";

export interface IUserService {
  getUserProfile(userId: string): Promise<UserProfileDto>;
  getUserProjects(userId: string): Promise<UserProjectsDto>;
  updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileDto>;
  getSkillSuggestions(): Promise<string[]>;
}
