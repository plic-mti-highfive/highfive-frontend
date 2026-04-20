import type { IUserService } from '../interfaces'
import type { UpdateUserProfileDto, UserProfileResponse } from '../../types'
import { delay } from './utils'
import { getAllUsers } from './data'

// Base de données mock pour les profils utilisateurs
class MockUserDb {
  private profiles: Map<string, UserProfileResponse> = new Map()

  constructor() {
    // Initialiser avec les profils depuis mockUsers centralisé
    const allUsers = getAllUsers()
    allUsers.forEach((user) => {
      if (user.profile) {
        this.profiles.set(user.id, {
          userId: user.id,
          email: user.email,
          bio: user.profile.bio,
          avatarPath: user.profile.avatarPath,
          themePreference: user.profile.themePreference,
          emailNotifications: user.profile.emailNotifications,
          createdAt: user.createdAt,
        })
      }
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
