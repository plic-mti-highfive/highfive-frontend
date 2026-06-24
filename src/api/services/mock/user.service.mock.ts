import type { IUserService } from "../interfaces";
import type {
  ListUsersQuery,
  PaginatedUsersResponse,
  UpdateUserProfileDto,
  UserProfileDto,
  UserProjectsDto,
} from "../../types";
import { delay } from "./utils";
import { getAllUsers } from "./data";

// Base de données mock pour les profils utilisateurs
class MockUserDb {
  private profiles: Map<string, UserProfileDto> = new Map();

  constructor() {
    const allUsers = getAllUsers();
    allUsers.forEach((user) => {
      if (user.profile) {
        this.profiles.set(user.id, {
          userId: user.id,
          bio: user.profile.bio,
          avatar: user.profile.avatarPath,
          themePreference: user.profile.themePreference,
          emailNotifications: user.profile.emailNotifications,
        });
      }
    });
  }

  getProfile(userId: string): UserProfileDto {
    return (
      this.profiles.get(userId) ?? {
        userId,
        bio: null,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        themePreference: "light",
        emailNotifications: true,
      }
    );
  }

  updateProfile(
    userId: string,
    updates: Partial<UserProfileDto>,
  ): UserProfileDto {
    const existing = this.getProfile(userId);
    const updated = { ...existing, ...updates };
    this.profiles.set(userId, updated);
    return updated;
  }
}

const db = new MockUserDb();

export class UserServiceMock implements IUserService {
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    await delay(200);
    const profile = db.getProfile(userId);
    return {
      userId,
      username: userId.substring(0, 8),
      displayName: userId.substring(0, 8),
      avatar:
        profile.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      bio: profile.bio,
      createdAt: new Date().toISOString(),
      skills: [],
      stats: {
        followers: 0,
        following: 0,
      },
      followers: [],
      following: [],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserProjects(userId: string): Promise<UserProjectsDto> {
    await delay(300);
    // Mock projects data
    return {
      created: [],
      collaborations: [],
      liked: [],
    };
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    await delay(400);

    return db.updateProfile(userId, dto);
  }

  async searchProfiles(query: ListUsersQuery): Promise<PaginatedUsersResponse> {
    await delay(300);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: query.limit || 20,
      totalPages: 1,
    };
  }
}
