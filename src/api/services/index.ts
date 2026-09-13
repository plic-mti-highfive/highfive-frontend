import { isMockMode } from "../config";
import type {
  IAuthService,
  IProjectService,
  ISearchService,
  IUserService,
} from "./interfaces";
import type {
  IMessagingService,
  INotificationService,
} from "./interfaces/messaging.service.interface";
import {
  MessagingServiceMock,
  NotificationServiceMock,
} from "./mock/messaging.service.mock";
import type { IIAMatchmakingService } from "./interfaces/ia-matchmaking.service.interface";

// Import des implémentations
import { AuthServiceMock, ProjectServiceMock, UserServiceMock } from "./mock";
import { AuthServiceHttp, ProjectServiceHttp, UserServiceHttp } from "./http";
import { IAMatchmakingServiceMock } from "./mock/ia-matchmaking.service.mock";
import { SearchServiceHttp } from "./http/search.service.http";
import { SearchServiceMock } from "./mock/search.service.mock";
import { IAMatchmakingServiceHttp } from "./http/ia-matchmaking.service.http";

// Factory pour créer les instances appropriées
class ServiceFactory {
  private _authService: IAuthService | null = null;
  private _projectService: IProjectService | null = null;
  private _userService: IUserService | null = null;
  private _iaMatchmakingService: IIAMatchmakingService | null = null;
  private _searchService: ISearchService | null = null;
  private _messagingService: IMessagingService | null = null;
  private _notificationService: INotificationService | null = null;

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

  get searchService(): ISearchService {
    if (!this._searchService) {
      this._searchService = isMockMode()
        ? new SearchServiceMock()
        : new SearchServiceHttp();
    }
    return this._searchService;
  }

  /**
   * Messagerie privee et notifications : mock dans les deux modes, faute de
   * routes correspondantes cote backend (cf. messaging.service.interface.ts).
   * Le choix est fait ici, une fois, plutot que dissemine dans des imports de
   * donnees mock au fond des composants.
   */
  get messagingService(): IMessagingService {
    if (!this._messagingService) {
      this._messagingService = new MessagingServiceMock();
    }
    return this._messagingService;
  }

  get notificationService(): INotificationService {
    if (!this._notificationService) {
      this._notificationService = new NotificationServiceMock();
    }
    return this._notificationService;
  }

  // Réinitialiser les services (utile si on change le mode à runtime)
  reset() {
    this._authService = null;
    this._projectService = null;
    this._userService = null;
    this._iaMatchmakingService = null;
    this._searchService = null;
    this._messagingService = null;
    this._notificationService = null;
  }
}

const factory = new ServiceFactory();

// Export des services
export const authService = factory.authService;
export const projectService = factory.projectService;
export const userService = factory.userService;
export const iaMatchmakingService = factory.iaMatchmakingService;
export const searchService = factory.searchService;
export const messagingService = factory.messagingService;
export const notificationService = factory.notificationService;

// Export de la factory pour pouvoir reset si besoin
export { factory as serviceFactory };

// Re-export des types
export type {
  IAuthService,
  IProjectService,
  IUserService,
  IIAMatchmakingService,
  ISearchService,
  IMessagingService,
  INotificationService,
};
