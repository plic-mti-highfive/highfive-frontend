import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";

import { AuthProvider } from "@shared/contexts";
import { ThemeProvider } from "@shared/contexts";
import { ErrorBoundary } from "@shared/components/ErrorBoundary";
import { AppProviders } from "./app/providers";

/**
 * En mode mock (VITE_API_MODE=mock), demarre MSW avant le premier rendu :
 * le store en memoire (`src/mocks/db.ts`) doit etre amorce (`seedDb`) avant
 * que le worker n'intercepte la moindre requete (V2-5). `onUnhandledRequest:
 * "warn"` laisse passer les assets Vite et les websockets Yjs/Hocuspocus
 * sans les faire echouer.
 */
async function enableMocking() {
  if (import.meta.env.VITE_API_MODE !== "mock") return;
  const { seedDb } = await import("./mocks/db");
  const { demoDataset } = await import("./mocks/data");
  const { worker } = await import("./mocks/browser");
  seedDb(demoDataset);
  await worker.start({ onUnhandledRequest: "warn" });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <AppProviders>
          <ThemeProvider>
            <BrowserRouter>
              <AuthProvider>
                <App />
              </AuthProvider>
            </BrowserRouter>
          </ThemeProvider>
        </AppProviders>
      </ErrorBoundary>
    </StrictMode>,
  );
});
