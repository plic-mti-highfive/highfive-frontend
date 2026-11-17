/* eslint-disable react-refresh/only-export-components -- utilitaire de test, pas de fast refresh */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

/** Affiche le chemin courant (pathname + search) pour verifier les redirections. */
export function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

export function Providers({
  children,
  client,
  initialEntries = ["/"],
}: {
  children: ReactNode;
  client: QueryClient;
  initialEntries?: string[];
}) {
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

/** Rend `ui` dans un QueryClient neuf et un routeur memoire. */
export function renderWithProviders(
  ui: ReactElement,
  options: { route?: string; client?: QueryClient } = {},
) {
  const client = options.client ?? createTestQueryClient();
  const result = render(
    <Providers client={client} initialEntries={[options.route ?? "/"]}>
      {ui}
    </Providers>,
  );
  return { ...result, client };
}

/** Rend `routes` ({ chemin: element }) avec une sonde de localisation. */
export function renderRoutes(
  routes: Record<string, ReactElement>,
  route: string,
) {
  return renderWithProviders(
    <>
      <LocationProbe />
      <Routes>
        {Object.entries(routes).map(([path, element]) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </>,
    { route },
  );
}
