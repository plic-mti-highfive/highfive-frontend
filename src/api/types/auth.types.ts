import type { UserStatus } from "@plic-mti-highfive/shared-types";

// DTOs Auth - alignés avec backend

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
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

export interface UserProfileDto {
  userId: string;
  bio: string | null;
  avatarPath: string | null;
  themePreference: string;
  emailNotifications: boolean;
}
