import type { IAuthService } from "../interfaces";
import type { LoginDto, RegisterDto, AuthResponse, UserDto } from "../../types";
import { UserStatus } from "@plic-mti-highfive/shared-types";
import { delay, generateId } from "./utils";
import { getUserByEmail, getAllUsers } from "./data";

// Mock user database with passwords
// Uses centralized mockUsers as the source of truth
const mockUserPasswords = new Map<string, string>([
  ["utilisateur@highfive.com", "password123"],
  ["johndoe@highfive.com", "password123"],
  ["janedoe@highfive.com", "password123"],
  ["alexsmith@highfive.com", "password123"],
  ["mariedurand@highfive.com", "password123"],
  ["alice@highfive.com", "password123"],
  ["bob@highfive.com", "password123"],
  ["carol@highfive.com", "password123"],
]);

// Store for newly registered users (in addition to mockUsers)
const registeredUsers = new Map<string, UserDto>();

// Mock tokens
const createMockTokens = () => ({
  accessToken: `mock-access-token-${Date.now()}`,
  refreshToken: `mock-refresh-token-${Date.now()}`,
});

export class AuthServiceMock implements IAuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    await delay(500);

    // Check if user already exists in mockUsers or registeredUsers
    const existingUser = getUserByEmail(dto.email);
    const existingRegisteredUser = Array.from(registeredUsers.values()).find(
      (u) => u.email === dto.email,
    );

    if (existingUser || existingRegisteredUser) {
      throw new Error("User already exists");
    }

    const userId = generateId();
    const user: UserDto = {
      id: userId,
      email: dto.email,
      status: UserStatus.ACTIVE,
      tenantId: "default-tenant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        bio: null,
        avatarPath: null,
        themePreference: "light",
        emailNotifications: true,
      },
    };

    // Store new user
    registeredUsers.set(userId, user);
    mockUserPasswords.set(dto.email, dto.password);

    const tokens = createMockTokens();

    return {
      ...tokens,
      user,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    await delay(500);

    // Check password
    const storedPassword = mockUserPasswords.get(dto.email);
    if (!storedPassword || storedPassword !== dto.password) {
      throw new Error("Invalid credentials");
    }

    // Find user (check both mockUsers and registeredUsers)
    let user = getUserByEmail(dto.email);
    if (!user) {
      user = Array.from(registeredUsers.values()).find(
        (u) => u.email === dto.email,
      );
    }

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const tokens = createMockTokens();

    return {
      ...tokens,
      user,
    };
  }

  async logout(): Promise<void> {
    await delay(300);
    // Mock logout - just simulate the delay
  }

  async refresh(): Promise<AuthResponse> {
    await delay(300);

    // For mock, just return new tokens
    const tokens = createMockTokens();

    // Return first user from mockUsers or registeredUsers
    const allUsers = getAllUsers();
    const user = allUsers[0] ||
      Array.from(registeredUsers.values())[0] || {
        id: "default-user-id",
        email: "user@example.com",
        status: UserStatus.ACTIVE,
        tenantId: "default-tenant",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          bio: null,
          avatarPath: null,
          themePreference: "light",
          emailNotifications: true,
        },
      };

    return {
      ...tokens,
      user,
    };
  }

  async getCurrentUser(): Promise<UserDto> {
    await delay(200);

    // Return first user from mockUsers or registeredUsers
    const allUsers = getAllUsers();
    const user = allUsers[0] ||
      Array.from(registeredUsers.values())[0] || {
        id: "default-user-id",
        email: "user@example.com",
        status: UserStatus.ACTIVE,
        tenantId: "default-tenant",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          bio: "Mock user bio",
          avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
          themePreference: "light",
          emailNotifications: true,
        },
      };

    return user;
  }
}
