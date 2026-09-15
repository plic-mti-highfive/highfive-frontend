import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApiError } from "@/api/client";

/**
 * Client TanStack Query (V2-7). `staleTime` de 30s : les listes du fil et
 * des fiches n'ont pas besoin d'etre revalidees a chaque rendu. Les erreurs
 * 4xx (403, 404, 400...) ne sont jamais retentees : ce sont des refus
 * definitifs, pas des pannes transitoires. Les erreurs reseau (status 0) et
 * 5xx beneficient d'un retry court.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * A brancher dans `src/main.tsx` autour de l'arbre applicatif. Non encore
 * cable dans `App.tsx`/le reste de l'arbre pour ne pas toucher aux fichiers
 * du chantier parallele (`src/shared/**`) — voir le rapport final.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
