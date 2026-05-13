// Configuration API

export type ApiMode = 'mock' | 'http'

export interface ApiConfig {
  mode: ApiMode
  baseUrl: string
  tenantId: string
}

// Configuration par défaut (peut être overridé par .env)
export const apiConfig: ApiConfig = {
  mode: (import.meta.env.VITE_API_MODE as ApiMode) ?? 'mock',
  baseUrl: import.meta.env.VITE_API_URL ?? '',
  tenantId: import.meta.env.VITE_TENANT_ID ?? 'default-tenant',
}

export const setApiMode = (mode: ApiMode) => {
  apiConfig.mode = mode
}

export const isHttpMode = () => apiConfig.mode === 'http'
export const isMockMode = () => apiConfig.mode === 'mock'
