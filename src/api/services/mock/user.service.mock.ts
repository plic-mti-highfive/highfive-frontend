import type { IUserService } from "../interfaces";
import type {
  ListUsersQuery,
  PaginatedUsersResponse,
  ProjectDto,
  UpdateUserProfileDto,
  UserProfileDto,
  UserProjectsDto,
} from "../../types";
import { delay } from "./utils";
import {
  getAllUsers,
  getProjectIdsJoinedBy,
  getProjectIdsOwnedBy,
  getProjectWithOwner,
} from "./data";

// Base de données mock pour les profils utilisateurs
class MockUserDb {
  private profiles: Map<string, UserProfileDto> = new Map();

  constructor() {
    const allUsers = getAllUsers();

    allUsers.forEach((user, index) => {
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
        // Derive de l'index plutot que tire au hasard : les compteurs
        // changeaient a chaque rechargement de la page.
        stats: {
          followers: (index * 7) % 43,
          following: (index * 5) % 29,
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

  getAllProfiles(): UserProfileDto[] {
    return Array.from(this.profiles.values());
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
    // Le profil construit par MockUserDb etait recupere puis aussitot ecrase :
    // le nom devenait un fragment d'identifiant (« user-1 »), les stats
    // retombaient a zero et la date de creation a aujourd'hui. On le renvoie
    // tel quel, comme le fait le backend.
    return db.getProfile(userId);
  }

  async getUserProjects(userId: string): Promise<UserProjectsDto> {
    await delay(300);
    // Renvoyait systematiquement des listes vides : tous les profils
    // affichaient « aucun projet », y compris pour les proprietaires.
    return {
      created: getProjectIdsOwnedBy(userId)
        .map(getProjectWithOwner)
        .filter((p): p is ProjectDto => p !== undefined),
      collaborations: getProjectIdsJoinedBy(userId)
        .map(getProjectWithOwner)
        .filter((p): p is ProjectDto => p !== undefined),
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

    let profiles = db.getAllProfiles();

    if (query.search) {
      const search = query.search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.displayName.toLowerCase().includes(search) ||
          p.username.toLowerCase().includes(search),
      );
    }

    const sorted = [...profiles].sort((a, b) => {
      switch (query.sortBy) {
        case "name":
          return a.displayName.localeCompare(b.displayName);
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popularity":
        default:
          return b.stats.followers - a.stats.followers;
      }
    });
    if (query.sortOrder === "ASC") sorted.reverse();

    const limit = query.limit || 20;
    const offset = query.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const data = sorted.slice(offset, offset + limit).map((p) => ({
      userId: p.userId,
      username: p.username,
      displayName: p.displayName,
      avatar: p.avatar,
    }));

    return {
      data,
      total: sorted.length,
      page,
      limit,
      totalPages: Math.ceil(sorted.length / limit) || 1,
    };
  }
}
