import type { ProjectDto } from "./project.types";

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
