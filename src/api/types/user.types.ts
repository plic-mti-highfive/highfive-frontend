// DTOs User - alignés avec backend

export interface UpdateUserProfileDto {
  bio?: string
  avatarPath?: string
  themePreference?: string
  emailNotifications?: boolean
}

export interface UserProfileResponse {
  userId: string
  bio: string | null
  avatarPath: string | null
  themePreference: string
  emailNotifications: boolean
}
