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
