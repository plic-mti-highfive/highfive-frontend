import type { IUserService } from "../interfaces";
import type { UpdateUserProfileDto, UserProfileResponse } from "../../types";
import { delay } from "./utils";
import { getAllUsers } from "./data";

// Base de données mock pour les profils utilisateurs
class MockUserDb {
  private profiles: Map<string, UserProfileResponse> = new Map();

  constructor() {
    const allUsers = getAllUsers();
    allUsers.forEach((user) => {
      if (user.profile) {
        this.profiles.set(user.id, {
          userId: user.id,
          bio: user.profile.bio,
          avatarPath: user.profile.avatarPath,
          themePreference: user.profile.themePreference,
          emailNotifications: user.profile.emailNotifications,
        });
      }
    });
  }

  getProfile(userId: string): UserProfileResponse {
    return (
      this.profiles.get(userId) ?? {
        userId,
        bio: null,
        avatarPath: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        themePreference: "light",
        emailNotifications: true,
      }
    );
  }

  updateProfile(
    userId: string,
    updates: Partial<UserProfileResponse>,
  ): UserProfileResponse {
    const existing = this.getProfile(userId);
    const updated = { ...existing, ...updates };
    this.profiles.set(userId, updated);
    return updated;
  }
}

const db = new MockUserDb();

export class UserServiceMock implements IUserService {
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    await delay(200);
    return db.getProfile(userId);
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponse> {
    await delay(400);

    return db.updateProfile(userId, dto);
  }
}
