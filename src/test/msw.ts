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
