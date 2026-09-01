import type { ProjectDto } from "./project.types";
import type { UserStatus } from "@plic-mti-highfive/shared-types";

export interface MinimalProfileDto {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface UserProfileDto {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string | null;
  createdAt: string;
  skills: string[];
  stats: {
    followers: number;
    following: number;
  };
  followers: MinimalProfileDto[];
  following: MinimalProfileDto[];
}

export interface UpdateUserProfileDto {
  displayName?: string;
  bio?: string;
  avatarPath?: string;
  themePreference?: string;
  emailNotifications?: boolean;
  skills?: string[];
}

export interface UserProjectsDto {
  created: ProjectDto[];
  collaborations: ProjectDto[];
  liked: ProjectDto[];
}

export interface ListUsersQuery {
  search?: string;
  tags?: string[];
  sortBy?: "date" | "name" | "popularity";
  sortOrder?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
}

export interface PaginatedUsersResponse {
  data: MinimalProfileDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Private User DTOs
export interface ProfileBaseDto {
  bio: string | null;
  avatarPath: string | null;
  themePreference: string;
  emailNotifications: boolean;
}

/**
 * Role plateforme. Defini ici et non dans shared-types, ou il n'existe pas :
 * le backend le declare aussi localement (shared/auth/system-role.enum.ts).
 */
export type SystemRole = "USER" | "ADMIN";

export interface UserDto {
  id: string;
  email: string;
  status: UserStatus;
  /** Renvoye par /auth/me. Necessaire pour reserver le dashboard aux admins. */
  systemRole?: SystemRole;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileBaseDto;
}
