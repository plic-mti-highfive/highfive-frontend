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
      const username = user.email.split("@")[0];
      const displayName = username
        .split(".")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

      this.profiles.set(user.id, {
        userId: user.id,
        username: username,
        displayName: displayName,
        avatar:
          user.profile?.avatarPath ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        bio: user.profile?.bio || null,
        createdAt: user.createdAt,
        skills: [],
        stats: {
          followers: Math.floor(Math.random() * 50),
          following: Math.floor(Math.random() * 50),
        },
        followers: [],
        following: [],
      });
    });
  }

  getProfile(userId: string): UserProfileDto {
    return (
      this.profiles.get(userId) ?? {
        userId,
        username: "unknown",
        displayName: "Utilisateur Inconnu",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        bio: null,
        createdAt: new Date().toISOString(),
        skills: [],
        stats: { followers: 0, following: 0 },
        followers: [],
        following: [],
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
  async getSkillSuggestions(): Promise<string[]> {
    await delay(100);
    return ["JavaScript", "TypeScript", "Python", "Java", "C#", "Go", "Rust"];
  }

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
  async getUserProjects(_userId: string): Promise<UserProjectsDto> {
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
