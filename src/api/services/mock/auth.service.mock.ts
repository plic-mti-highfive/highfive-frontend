import type { IAuthService } from "../interfaces";
import type { LoginDto, RegisterDto, AuthResponse, UserDto } from "../../types";
import { UserStatus } from "@plic-mti-highfive/shared-types";
import { tokenStorage } from "../../http-client";
import { delay, generateId } from "./utils";
import { getUserByEmail, getAllUsers } from "./data";

/**
 * Mot de passe unique de tous les comptes de demonstration.
 * Les identifiants etaient auparavant listes a la main, sur des emails qui
 * n'existaient dans aucun mock : les deux ensembles avaient diverge et plus
 * personne ne pouvait se connecter. On derive donc les comptes de `mockUsers`,
 * seule source de verite, pour que la liste ne puisse plus se desynchroniser.
 */
export const MOCK_PASSWORD = "password123";

const STORAGE_KEY_REGISTERED = "mock_registered_users";

/** Comptes crees via `register`, persistes pour survivre a un rechargement. */
function loadRegisteredUsers(): Map<string, UserDto> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED);
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw) as Record<string, UserDto>));
  } catch {
    return new Map();
  }
}

function saveRegisteredUsers(users: Map<string, UserDto>): void {
  localStorage.setItem(
    STORAGE_KEY_REGISTERED,
    JSON.stringify(Object.fromEntries(users)),
  );
}

/** Mots de passe : tous les mocks, plus les comptes crees a l'execution. */
const extraPasswords = new Map<string, string>();

function passwordFor(email: string): string | undefined {
  if (getUserByEmail(email)) return MOCK_PASSWORD;
  return extraPasswords.get(email);
}

function findUser(email: string): UserDto | undefined {
  return (
    getUserByEmail(email) ??
    Array.from(loadRegisteredUsers().values()).find((u) => u.email === email)
  );
}

function findUserById(userId: string): UserDto | undefined {
  return (
    getAllUsers().find((u) => u.id === userId) ??
    loadRegisteredUsers().get(userId)
  );
}

/**
 * Le token encode l'utilisateur, comme le `sub` d'un vrai JWT : c'est ce qui
 * permet a `getCurrentUser` de rendre le compte reellement connecte plutot
 * qu'un utilisateur arbitraire, et de le retrouver apres un rechargement.
 */
function createTokens(userId: string) {
  const payload = btoa(userId);
  return {
    accessToken: `mock-access-token.${payload}.${Date.now()}`,
    refreshToken: `mock-refresh-token.${payload}.${Date.now()}`,
  };
}

function userIdFromToken(token: string): string | null {
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    return atob(payload);
  } catch {
    return null;
  }
}

export class AuthServiceMock implements IAuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    await delay(500);

    if (findUser(dto.email)) {
      throw new Error("User already exists");
    }

    const userId = generateId();
    const user: UserDto = {
      id: userId,
      email: dto.email,
      status: UserStatus.ACTIVE,
      systemRole: "USER",
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

    const registered = loadRegisteredUsers();
    registered.set(userId, user);
    saveRegisteredUsers(registered);
    extraPasswords.set(dto.email, dto.password);

    return { ...this.storeSession(userId), user };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    await delay(500);

    const expected = passwordFor(dto.email);
    const user = findUser(dto.email);
    if (!user || !expected || expected !== dto.password) {
      throw new Error("Invalid credentials");
    }

    return { ...this.storeSession(user.id), user };
  }

  async logout(): Promise<void> {
    await delay(300);
    tokenStorage.clearTokens();
  }

  async refresh(): Promise<AuthResponse> {
    await delay(300);

    const user = await this.getCurrentUser();
    return { ...this.storeSession(user.id), user };
  }

  async getCurrentUser(): Promise<UserDto> {
    await delay(200);

    const token = tokenStorage.getAccessToken();
    const userId = token ? userIdFromToken(token) : null;
    const user = userId ? findUserById(userId) : undefined;
    // Sans session valide, on echoue comme le ferait le backend (401) : c'est
    // ce que AuthContext attend pour purger les tokens.
    if (!user) throw new Error("Not authenticated");

    return user;
  }

  /** Persiste la session, comme le fait l'implementation HTTP. */
  private storeSession(userId: string) {
    const tokens = createTokens(userId);
    tokenStorage.setAccessToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken);
    return tokens;
  }
}
