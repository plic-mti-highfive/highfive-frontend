import { UserStatus } from "@plic-mti-highfive/shared-types";
import type { ProjectDto } from "./project.types";

export interface UserProfileDto {
  bio: string | null;
  avatarPath: string | null;
  themePreference: string;
  emailNotifications: boolean;
}

export interface UserDto {
  id: string;
  email: string;
  status: UserStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfileDto;
}

// Body pour PATCH /users/:id/profile
export interface UpdateUserProfileDto {
  bio?: string;
  avatarPath?: string;
  themePreference?: string;
  emailNotifications?: boolean;
}

// Retour de GET /users/:id/profile (Profil public enrichi)
export interface EnrichedUserProfileResponse {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  createdAt: string;
  tags: string[];
  stats: {
    followers: number;
    following: number;
  };
}

// Retour de GET /users/:id/projects
export interface UserProjectsResponse {
  created: ProjectDto[];
  collaborations: ProjectDto[];
  liked: ProjectDto[];
}
