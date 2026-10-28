import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { demoDataset } from "@/mocks/data";
import { seedDb } from "@/mocks/db";
import { handlers } from "@/mocks/handlers";

/**
 * Serveur MSW de test : reutilise les handlers du mode mock (`src/mocks`),
 * donc aucun backend ni base reelle. Le store en memoire est reamorce avec le
 * jeu de demo avant chaque test, le jeton stocke est efface apres.
 * A appeler une fois au niveau racine d'un fichier de test.
 */
export const server = setupServer(...handlers);

export function setupMswServer(): void {
  beforeAll(() => {
    vi.stubEnv("VITE_MOCK_DELAY", "off");
    server.listen({ onUnhandledRequest: "error" });
  });
  beforeEach(() => {
    seedDb(demoDataset);
  });
  afterEach(() => {
    server.resetHandlers();
    cleanup();
    localStorage.clear();
  });
  afterAll(() => {
    server.close();
    vi.unstubAllEnvs();
  });
}

/** Connecte `email` via l'API mock et stocke le jeton (comme le fait l'application). */
export async function loginAs(
  email: string,
  password = "demo1234",
): Promise<void> {
  const { login } = await import("@/api/auth");
  const { tokenStorage } = await import("@/api/token-storage");
  const session = await login({ email, password });
  tokenStorage.setAccessToken(session.token);
}

/** Enregistre les requetes sortantes (methode + chemin + recherche) du serveur de test. */
export function recordRequests(): { log: string[]; stop: () => void } {
  const log: string[] = [];
  const listener = ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    log.push(`${request.method} ${url.pathname}${url.search}`);
  };
  server.events.on("request:start", listener);
  return {
    log,
    stop: () => server.events.removeListener("request:start", listener),
  };
}
