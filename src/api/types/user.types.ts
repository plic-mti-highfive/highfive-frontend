export interface UserDto {
  id: string;
  email: string;
  status: import("@plic-mti-highfive/shared-types").UserStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfileDto;
}

export interface UserProfileDto {
  userId: string;
  bio: string | null;
  avatarPath: string | null;
  themePreference: string;
  emailNotifications: boolean;
}

export interface UpdateUserProfileDto {
  bio?: string;
  avatarPath?: string;
  themePreference?: string;
  emailNotifications?: boolean;
}

export interface UserProfileResponse {
  userId: string;
  bio: string | null;
  avatarPath: string | null;
  themePreference: string;
  emailNotifications: boolean;
}

/**
 * Enriched user profile response from backend
 * Includes skills, stats (follower/following counts only)
 */
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

/**
 * User projects grouped by category
 * calculated from backend database relationships
 */
export interface UserProjectsResponse {
  created: import("@shared/types/project").Project[];
  collaborations: import("@shared/types/project").Project[];
  liked: import("@shared/types/project").Project[];
}
