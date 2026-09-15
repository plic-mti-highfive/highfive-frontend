// Configuration du client fetch unique (V2-5). Seule la base URL du backend
// est necessaire ici : le mode mock/http se lit directement via
// `VITE_API_MODE` (src/main.tsx demarre MSW en mode mock avant le premier
// rendu) et n'a pas besoin d'etre reflete dans un objet de configuration
// partage.
export interface ApiConfig {
  baseUrl: string;
}

export const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
};
