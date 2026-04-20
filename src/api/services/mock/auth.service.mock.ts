import type { IAuthService } from '../interfaces'
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  UserDto,
} from '../../types'
import { UserStatus } from '../../types'
import { delay } from './utils'

// Mock user database
const mockUserDb = new Map<string, { email: string; password: string; user: UserDto }>()

// Mock tokens
const createMockTokens = () => ({
  accessToken: `mock-access-token-${Date.now()}`,
  refreshToken: `mock-refresh-token-${Date.now()}`,
})

export class AuthServiceMock implements IAuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    await delay(500)

    if (mockUserDb.has(dto.email)) {
      throw new Error('User already exists')
    }

    const user: UserDto = {
      id: `user-${Date.now()}`,
      email: dto.email,
      status: UserStatus.ACTIVE,
      tenantId: 'default-tenant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        userId: `user-${Date.now()}`,
        bio: null,
        avatarPath: null,
        themePreference: 'light',
        emailNotifications: true,
      },
    }

    mockUserDb.set(dto.email, {
      email: dto.email,
      password: dto.password,
      user,
    })

    const tokens = createMockTokens()

    return {
      ...tokens,
      user,
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    await delay(500)

    const userRecord = mockUserDb.get(dto.email)

    if (!userRecord || userRecord.password !== dto.password) {
      throw new Error('Invalid credentials')
    }

    const tokens = createMockTokens()

    return {
      ...tokens,
      user: userRecord.user,
    }
  }

  async logout(): Promise<void> {
    await delay(300)
    // Mock logout - just simulate the delay
  }

  async refresh(): Promise<AuthResponse> {
    await delay(300)

    // For mock, just return new tokens
    const tokens = createMockTokens()

    // Return first user in db or create a default one
    const firstUser = Array.from(mockUserDb.values())[0]
    const user = firstUser
      ? firstUser.user
      : {
          id: 'default-user-id',
          email: 'user@example.com',
          status: UserStatus.ACTIVE,
          tenantId: 'default-tenant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

    return {
      ...tokens,
      user,
    }
  }

  async getCurrentUser(): Promise<UserDto> {
    await delay(200)

    // Return first user or default
    const firstUser = Array.from(mockUserDb.values())[0]

    if (firstUser) {
      return firstUser.user
    }

    return {
      id: 'default-user-id',
      email: 'user@example.com',
      status: UserStatus.ACTIVE,
      tenantId: 'default-tenant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        userId: 'default-user-id',
        bio: 'Mock user bio',
        avatarPath: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        themePreference: 'light',
        emailNotifications: true,
      },
    }
  }
}
