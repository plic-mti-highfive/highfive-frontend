import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Worker MSW (public/mockServiceWorker.js). Demarre depuis `src/main.tsx`
 * quand `VITE_API_MODE === "mock"` (V2-5). `seedDb` doit avoir ete appele
 * avant `worker.start()` (voir `src/mocks/data` + `src/mocks/db.ts`).
 */
export const worker = setupWorker(...handlers);
