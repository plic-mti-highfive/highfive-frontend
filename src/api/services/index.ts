import { isMockMode } from "../config";
import type { IAuthService, IProjectService, IUserService } from "./interfaces";

// Import des implémentations
import { AuthServiceMock, ProjectServiceMock, UserServiceMock } from "./mock";
import { AuthServiceHttp, ProjectServiceHttp, UserServiceHttp } from "./http";

// Factory pour créer les instances appropriées
class ServiceFactory {
  private _authService: IAuthService | null = null;
  private _projectService: IProjectService | null = null;
  private _userService: IUserService | null = null;

  get authService(): IAuthService {
    if (!this._authService) {
      this._authService = isMockMode()
        ? new AuthServiceMock()
        : new AuthServiceHttp();
    }
    return this._authService;
  }

  get projectService(): IProjectService {
    if (!this._projectService) {
      this._projectService = isMockMode()
        ? new ProjectServiceMock()
        : new ProjectServiceHttp();
    }
    return this._projectService;
  }

  get userService(): IUserService {
    if (!this._userService) {
      this._userService = isMockMode()
        ? new UserServiceMock()
        : new UserServiceHttp();
    }
    return this._userService;
  }

  // Réinitialiser les services (utile si on change le mode à runtime)
  reset() {
    this._authService = null;
    this._projectService = null;
    this._userService = null;
  }
}

const factory = new ServiceFactory();

// Export des services
export const authService = factory.authService;
export const projectService = factory.projectService;
export const userService = factory.userService;

// Re-export des types
export type { IAuthService, IProjectService, IUserService };
