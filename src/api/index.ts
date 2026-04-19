// Point d'entrée principal de la couche API

// Export de la configuration
export { apiConfig, setApiMode, isHttpMode, isMockMode } from './config'
export type { ApiConfig, ApiMode } from './config'

// Export du client HTTP
export { httpClient, tokenStorage, ApiError } from './http-client'
export type { RequestConfig } from './http-client'

// Export des types
export * from './types'

// Export des services (factory qui retourne mock ou http selon config)
export { authService, projectService, userService, serviceFactory } from './services'
export type { IAuthService, IProjectService, IUserService } from './services'
