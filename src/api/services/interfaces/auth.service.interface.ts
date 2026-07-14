import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  UserDto,
} from "../../types";

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponse>;
  login(dto: LoginDto): Promise<AuthResponse>;
  logout(): Promise<void>;
  refresh(dto: RefreshTokenDto): Promise<AuthResponse>;
  getCurrentUser(): Promise<UserDto>;
}
