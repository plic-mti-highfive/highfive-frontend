// Stockage du jeton d'acces (V2-5). Le client fetch unique (client.ts) le
// lit pour l'en-tete Authorization ; src/api/queries/auth.ts l'ecrit apres
// connexion/inscription et le vide a la deconnexion. Pas de jeton de
// rafraichissement separe : le contrat v2 (`Session`, src/domain/auth.ts)
// n'en expose pas.
class TokenStorage {
  private readonly ACCESS_TOKEN_KEY = "access_token";

  setAccessToken(token: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }
}

export const tokenStorage = new TokenStorage();
