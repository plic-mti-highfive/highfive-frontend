import type { IAuthService } from '../interfaces'
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  UserDto,
} from '../../types'
import { httpClient, tokenStorage } from '../../http-client'

export class AuthServiceHttp implements IAuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/register', dto)
    this.storeTokens(response)
    return response
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/login', dto)
    this.storeTokens(response)
    return response
  }

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken()
    if (refreshToken) {
      await httpClient.post('/auth/logout', { refreshToken })
    }
    tokenStorage.clearTokens()
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/refresh', dto)
    this.storeTokens(response)
    return response
  }

  async getCurrentUser(): Promise<UserDto> {
    return httpClient.get<UserDto>('/auth/me')
  }

  private storeTokens(response: AuthResponse): void {
    tokenStorage.setAccessToken(response.accessToken)
    tokenStorage.setRefreshToken(response.refreshToken)
  }
}
