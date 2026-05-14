import { isMockMode } from "../config";
import type { IAuthService, IProjectService, IUserService } from "./interfaces";
import type { IIAMatchmakingService } from "./interfaces/ia-matchmaking.service.interface";

// Import des implémentations
import { AuthServiceMock, ProjectServiceMock, UserServiceMock } from "./mock";
import { AuthServiceHttp, ProjectServiceHttp, UserServiceHttp } from "./http";
import { IAMatchmakingServiceMock } from "./mock/ia-matchmaking.service.mock";
import { IAMatchmakingServiceHttp } from "./http/ia-matchmaking.service.http";

// Factory pour créer les instances appropriées
class ServiceFactory {
  private _authService: IAuthService | null = null;
  private _projectService: IProjectService | null = null;
  private _userService: IUserService | null = null;
  private _iaMatchmakingService: IIAMatchmakingService | null = null;

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

  get iaMatchmakingService(): IIAMatchmakingService {
    if (!this._iaMatchmakingService) {
      this._iaMatchmakingService = isMockMode()
        ? new IAMatchmakingServiceMock()
        : new IAMatchmakingServiceHttp();
    }
    return this._iaMatchmakingService;
  }

  // Réinitialiser les services (utile si on change le mode à runtime)
  reset() {
    this._authService = null;
    this._projectService = null;
    this._userService = null;
    this._iaMatchmakingService = null;
  }
}

const factory = new ServiceFactory();

// Export des services
export const authService = factory.authService;
export const projectService = factory.projectService;
export const userService = factory.userService;
export const iaMatchmakingService = factory.iaMatchmakingService;

// Re-export des types
export type {
  IAuthService,
  IProjectService,
  IUserService,
  IIAMatchmakingService,
};
