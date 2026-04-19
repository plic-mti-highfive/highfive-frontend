import type { IUserService } from '../interfaces'
import type { UpdateUserProfileDto, UserProfileResponse } from '../../types'
import { delay } from './utils'
import { mockUsers } from '@shared/data/mockUsers'

// Base de données mock pour les profils utilisateurs
class MockUserDb {
  private profiles: Map<string, UserProfileResponse> = new Map()

  constructor() {
    // Initialiser avec quelques profils basés sur mockUsers
    Object.values(mockUsers).forEach((user, index) => {
      const userId = `user-${index + 1}`
      this.profiles.set(userId, {
        userId,
        email: `${user.username}@example.com`,
        bio: user.bio,
        avatarPath: user.avatar,
        themePreference: 'light',
        emailNotifications: true,
        createdAt: user.createdAt,
      })
    })
  }

  getProfile(userId: string): UserProfileResponse | undefined {
    return this.profiles.get(userId)
  }

  updateProfile(userId: string, updates: Partial<UserProfileResponse>): UserProfileResponse {
    const existing = this.profiles.get(userId) || {
      userId,
      email: `user-${userId}@example.com`,
      bio: null,
      avatarPath: null,
      themePreference: 'light',
      emailNotifications: true,
      createdAt: new Date().toISOString(),
    }

    const updated = { ...existing, ...updates }
    this.profiles.set(userId, updated)
    return updated
  }
}

const db = new MockUserDb()

export class UserServiceMock implements IUserService {
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    await delay(200)

    const profile = db.getProfile(userId)
    if (!profile) {
      throw new Error('User not found')
    }

    return profile
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponse> {
    await delay(400)

    return db.updateProfile(userId, dto)
  }
}
