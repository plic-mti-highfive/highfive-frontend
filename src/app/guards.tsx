import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@shared/contexts";
import { Spinner } from "@shared/ui";

/**
 * Gardes de routes (deplacees depuis src/shared/components/ProtectedRoute.tsx,
 * V2 item 1). R-NAV6 : une route protegee renvoie vers
 * `/connexion?suite=<route>` et y ramene apres connexion (voir
 * `src/features/auth/pages/LoginPage.tsx`).
 */

function AuthPending() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}

function loginRedirect(location: { pathname: string; search: string }) {
  const suite = `${location.pathname}${location.search}`;
  return `/connexion?suite=${encodeURIComponent(suite)}`;
}

/** Reserve une route aux personnes connectees. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthPending />;
  if (!isAuthenticated) {
    return <Navigate to={loginRedirect(location)} replace />;
  }
  return <>{children}</>;
}

/** Reserve une route aux administrateurs plateforme (`platformRole === "admin"`). */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthPending />;
  if (!isAuthenticated) {
    return <Navigate to={loginRedirect(location)} replace />;
  }
  // Une personne non admin n'a pas a savoir que cette page existe : on
  // renvoie sur l'accueil plutot que d'afficher un refus.
  if (user?.platformRole !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
